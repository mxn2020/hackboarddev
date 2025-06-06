const { Redis } = require('@upstash/redis');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const { parse } = require('cookie');

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const AUTH_MODE = process.env.AUTH_MODE || 'cookie'; // 'cookie' or 'bearer'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Authentication middleware
async function authenticateUser(event) {
  // Extract token based on auth mode
  let token;
  const authHeader = event.headers.authorization || event.headers.Authorization;

  if (AUTH_MODE === 'bearer') {
    // Bearer token mode - only check Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  } else {
    // Cookie mode - check both header and cookies for backward compatibility
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Check for token in cookies
      const cookies = event.headers.cookie;
      if (cookies) {
        const parsedCookies = parse(cookies);
        token = parsedCookies.auth_token;
      }
    }
  }

  if (!token) {
    throw new Error('No token provided');
  }

  if (token.trim() === '' || token === 'null' || token === 'undefined') {
    throw new Error('Invalid token format');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.sub || decoded.userId; // Use 'sub' field which contains the user ID
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    throw new Error('Invalid token');
  }
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const { httpMethod, path } = event;
    const pathParts = path.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];

    // Define routes that don't require authentication (read-only)
    const publicRoutes = ['posts', 'tags'];
    const isPublicRoute = httpMethod === 'GET' && publicRoutes.includes(action);

    let userId = null;
    let user = null;

    if (!isPublicRoute) {
      // Authenticate user for protected requests
      try {
        userId = await authenticateUser(event);
      } catch (authError) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: authError.message || 'Authentication required' }),
        };
      }

      // Get user data to include in responses
      const userData = await redis.get(`user:${userId}`);
      user = userData ? (typeof userData === 'string' ? JSON.parse(userData) : userData) : null;

      if (!user) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'User not found' }),
        };
      }
    } else {
      // For public routes, try to get user data if authentication is provided (optional)
      try {
        userId = await authenticateUser(event);
        const userData = await redis.get(`user:${userId}`);
        user = userData ? (typeof userData === 'string' ? JSON.parse(userData) : userData) : null;
      } catch (authError) {
        // Ignore authentication errors for public routes
        console.log('No authentication provided for public route, proceeding without user context');
      }
    }

    switch (httpMethod) {
      case 'GET':
        if (action === 'posts') {
          return await getPosts(event, userId);
        } else if (action === 'team-requests') {
          return await getTeamRequests(event, userId);
        } else if (action === 'tags') {
          return await getPopularTags(event);
        }
        break;
      case 'POST':
        if (action === 'posts') {
          return await createPost(event, userId, user);
        } else if (action === 'team-requests') {
          return await createTeamRequest(event, userId, user);
        } else if (action === 'like') {
          return await likePost(event, userId);
        } else if (action === 'bookmark') {
          return await bookmarkPost(event, userId);
        }
        break;
      case 'DELETE':
        if (pathParts.includes('posts')) {
          const postId = pathParts[pathParts.indexOf('posts') + 1];
          if (postId) {
            return await deletePost(postId, userId);
          }
        } else if (pathParts.includes('team-requests')) {
          const requestId = pathParts[pathParts.indexOf('team-requests') + 1];
          if (requestId) {
            return await deleteTeamRequest(requestId, userId);
          }
        }
        break;
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };
  } catch (error) {
    console.error('Hackboard function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// Get all posts with optional filtering
async function getPosts(event, userId) {
  try {
    const queryParams = event.queryStringParameters || {};
    const { category, tag, search, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;

    // Get all post IDs
    const postIds = await redis.lrange('hackboard:posts', 0, -1);
    
    if (!postIds || postIds.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ posts: [] }),
      };
    }

    // Get all posts data
    const postsData = await Promise.all(
      postIds.map(async (id) => {
        const post = await redis.hgetall(`hackboard:post:${id}`);
        if (!post || !post.id) return null;

        // Parse tags if stored as string
        if (typeof post.tags === 'string') {
          try {
            post.tags = JSON.parse(post.tags);
          } catch (e) {
            post.tags = [];
          }
        }

        // Check if user has bookmarked this post (only if user is authenticated)
        if (userId) {
          const isBookmarked = await redis.sismember(`user:${userId}:bookmarks`, post.id);
          post.isBookmarked = !!isBookmarked;
        } else {
          post.isBookmarked = false;
        }

        return post;
      })
    );

    // Filter out null values and apply filters
    let filteredPosts = postsData.filter(post => post !== null);

    // Apply category filter
    if (category) {
      filteredPosts = filteredPosts.filter(post => post.category === category);
    }

    // Apply tag filter
    if (tag) {
      filteredPosts = filteredPosts.filter(post => {
        const postTags = Array.isArray(post.tags) ? post.tags : [];
        return postTags.includes(tag);
      });
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) || 
        post.content.toLowerCase().includes(searchLower)
      );
    }

    // Sort posts
    filteredPosts.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ posts: filteredPosts }),
    };
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
}

// Create a new post
async function createPost(event, userId, user) {
  try {
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { title, content, category, tags } = requestBody;

    if (!title || !content || !category) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Title, content, and category are required' }),
      };
    }

    const postId = nanoid();
    const now = new Date().toISOString();

    const post = {
      id: postId,
      title,
      content,
      category,
      tags: Array.isArray(tags) ? tags : [],
      author: {
        id: userId,
        name: user.name || user.username,
        avatar: user.avatar || null,
      },
      likes: 0,
      comments: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Store post data
    await redis.hset(`hackboard:post:${postId}`, post);
    
    // Add to posts list
    await redis.lpush('hackboard:posts', postId);
    
    // Add to user's posts
    await redis.sadd(`user:${userId}:posts`, postId);

    // Add to category index
    await redis.sadd(`hackboard:category:${category}`, postId);

    // Add to tag indices
    for (const tag of post.tags) {
      await redis.sadd(`hackboard:tag:${tag}`, postId);
    }

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, post }),
    };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

// Delete a post
async function deletePost(postId, userId) {
  try {
    // Get post data
    const post = await redis.hgetall(`hackboard:post:${postId}`);
    
    if (!post || !post.id) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Post not found' }),
      };
    }

    // Check if user is the author
    if (post.author && typeof post.author === 'object' && post.author.id !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'You can only delete your own posts' }),
      };
    }

    // Parse tags if stored as string
    let tags = [];
    if (typeof post.tags === 'string') {
      try {
        tags = JSON.parse(post.tags);
      } catch (e) {
        tags = [];
      }
    } else if (Array.isArray(post.tags)) {
      tags = post.tags;
    }

    // Delete post data
    await redis.del(`hackboard:post:${postId}`);
    
    // Remove from posts list
    await redis.lrem('hackboard:posts', 0, postId);
    
    // Remove from user's posts
    await redis.srem(`user:${userId}:posts`, postId);

    // Remove from category index
    if (post.category) {
      await redis.srem(`hackboard:category:${post.category}`, postId);
    }

    // Remove from tag indices
    for (const tag of tags) {
      await redis.srem(`hackboard:tag:${tag}`, postId);
    }

    // Remove from all users' bookmarks
    // This is a simplification - in production you might want to track which users bookmarked this post
    const bookmarkKeys = await redis.keys(`user:*:bookmarks`);
    for (const key of bookmarkKeys) {
      await redis.srem(key, postId);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, message: 'Post deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

// Like a post
async function likePost(event, userId) {
  try {
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { postId } = requestBody;

    if (!postId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Post ID is required' }),
      };
    }

    // Check if post exists
    const post = await redis.hgetall(`hackboard:post:${postId}`);
    if (!post || !post.id) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Post not found' }),
      };
    }

    // Check if user already liked this post
    const alreadyLiked = await redis.sismember(`hackboard:post:${postId}:likes`, userId);
    
    if (alreadyLiked) {
      // Unlike the post
      await redis.srem(`hackboard:post:${postId}:likes`, userId);
      
      // Decrement likes count
      const newLikesCount = await redis.hincrby(`hackboard:post:${postId}`, 'likes', -1);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: true, 
          liked: false, 
          likesCount: newLikesCount,
          message: 'Post unliked successfully' 
        }),
      };
    } else {
      // Like the post
      await redis.sadd(`hackboard:post:${postId}:likes`, userId);
      
      // Increment likes count
      const newLikesCount = await redis.hincrby(`hackboard:post:${postId}`, 'likes', 1);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: true, 
          liked: true, 
          likesCount: newLikesCount,
          message: 'Post liked successfully' 
        }),
      };
    }
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
}

// Bookmark a post
async function bookmarkPost(event, userId) {
  try {
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { postId } = requestBody;

    if (!postId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Post ID is required' }),
      };
    }

    // Check if post exists
    const post = await redis.hgetall(`hackboard:post:${postId}`);
    if (!post || !post.id) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Post not found' }),
      };
    }

    // Check if user already bookmarked this post
    const alreadyBookmarked = await redis.sismember(`user:${userId}:bookmarks`, postId);
    
    if (alreadyBookmarked) {
      // Remove bookmark
      await redis.srem(`user:${userId}:bookmarks`, postId);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: true, 
          bookmarked: false, 
          message: 'Bookmark removed successfully' 
        }),
      };
    } else {
      // Add bookmark
      await redis.sadd(`user:${userId}:bookmarks`, postId);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: true, 
          bookmarked: true, 
          message: 'Post bookmarked successfully' 
        }),
      };
    }
  } catch (error) {
    console.error('Error bookmarking post:', error);
    throw error;
  }
}

// Get team requests
async function getTeamRequests(event, userId) {
  try {
    // Get all team request IDs
    const requestIds = await redis.lrange('hackboard:team_requests', 0, -1);
    
    if (!requestIds || requestIds.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ teamRequests: [] }),
      };
    }

    // Get all team requests data
    const requestsData = await Promise.all(
      requestIds.map(async (id) => {
        const request = await redis.hgetall(`hackboard:team_request:${id}`);
        if (!request || !request.id) return null;

        // Parse skills if stored as string
        if (typeof request.skills === 'string') {
          try {
            request.skills = JSON.parse(request.skills);
          } catch (e) {
            request.skills = [];
          }
        }

        // Parse author if stored as string
        if (typeof request.author === 'string') {
          try {
            request.author = JSON.parse(request.author);
          } catch (e) {
            request.author = { id: 'unknown', name: 'Unknown User' };
          }
        }

        return request;
      })
    );

    // Filter out null values
    const teamRequests = requestsData.filter(request => request !== null);

    // Sort by creation date (newest first)
    teamRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ teamRequests }),
    };
  } catch (error) {
    console.error('Error getting team requests:', error);
    throw error;
  }
}

// Create a team request
async function createTeamRequest(event, userId, user) {
  try {
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { skills, description } = requestBody;

    if (!skills || !skills.length || !description) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Skills and description are required' }),
      };
    }

    const requestId = nanoid();
    const now = new Date().toISOString();

    const teamRequest = {
      id: requestId,
      author: JSON.stringify({
        id: userId,
        name: user.name || user.username,
        avatar: user.avatar || null,
      }),
      skills: JSON.stringify(skills),
      description,
      createdAt: now,
      updatedAt: now,
    };

    // Store team request data
    await redis.hset(`hackboard:team_request:${requestId}`, teamRequest);
    
    // Add to team requests list
    await redis.lpush('hackboard:team_requests', requestId);
    
    // Add to user's team requests
    await redis.sadd(`user:${userId}:team_requests`, requestId);

    // Parse back for response
    const responseTeamRequest = {
      ...teamRequest,
      author: JSON.parse(teamRequest.author),
      skills: JSON.parse(teamRequest.skills),
    };

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, teamRequest: responseTeamRequest }),
    };
  } catch (error) {
    console.error('Error creating team request:', error);
    throw error;
  }
}

// Delete a team request
async function deleteTeamRequest(requestId, userId) {
  try {
    // Get team request data
    const request = await redis.hgetall(`hackboard:team_request:${requestId}`);
    
    if (!request || !request.id) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Team request not found' }),
      };
    }

    // Parse author if stored as string
    let author = request.author;
    if (typeof author === 'string') {
      try {
        author = JSON.parse(author);
      } catch (e) {
        author = { id: 'unknown' };
      }
    }

    // Check if user is the author
    if (author.id !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'You can only delete your own team requests' }),
      };
    }

    // Delete team request data
    await redis.del(`hackboard:team_request:${requestId}`);
    
    // Remove from team requests list
    await redis.lrem('hackboard:team_requests', 0, requestId);
    
    // Remove from user's team requests
    await redis.srem(`user:${userId}:team_requests`, requestId);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, message: 'Team request deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting team request:', error);
    throw error;
  }
}

// Get popular tags
async function getPopularTags(event) {
  try {
    // Get all tag keys
    const tagKeys = await redis.keys('hackboard:tag:*');
    
    if (!tagKeys || tagKeys.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ tags: [] }),
      };
    }

    // Get tag counts
    const tagCounts = await Promise.all(
      tagKeys.map(async (key) => {
        const tag = key.replace('hackboard:tag:', '');
        const count = await redis.scard(key);
        return { tag, count };
      })
    );

    // Sort by count (descending)
    tagCounts.sort((a, b) => b.count - a.count);

    // Take top 20 tags
    const popularTags = tagCounts.slice(0, 20).map(item => item.tag);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ tags: popularTags }),
    };
  } catch (error) {
    console.error('Error getting popular tags:', error);
    throw error;
  }
}