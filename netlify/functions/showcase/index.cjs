const { Redis } = require('@upstash/redis');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const { parse } = require('cookie');
const { getResources, bookmarkResource, submitResource, seedResources } = require('./resources.cjs');

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

// Seed initial projects if they don't exist
async function seedProjects() {
  const projectsExist = await redis.exists('showcase:projects_list');
  if (projectsExist) {
    return;
  }

  const projects = [
    {
      id: 'project_1',
      title: 'AI-Powered Task Manager',
      description: 'A task management app that uses AI to prioritize and categorize your tasks automatically. Built with React, Node.js, and OpenAI.',
      imageUrl: 'https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      demoUrl: 'https://ai-task-manager.netlify.app',
      repoUrl: 'https://github.com/username/ai-task-manager',
      author: {
        id: 'user1',
        name: 'Alex Johnson',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      category: 'productivity',
      tags: ['AI', 'React', 'Node.js', 'OpenAI'],
      likes: 124,
      comments: 18,
      createdAt: new Date('2025-05-15T10:30:00Z').toISOString(),
      featured: true
    },
    {
      id: 'project_2',
      title: 'EcoTrack - Carbon Footprint Calculator',
      description: 'An app that helps users track and reduce their carbon footprint through daily activities. Features interactive visualizations and personalized recommendations.',
      imageUrl: 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      demoUrl: 'https://ecotrack-demo.vercel.app',
      repoUrl: 'https://github.com/username/ecotrack',
      author: {
        id: 'user2',
        name: 'Samantha Lee',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      category: 'sustainability',
      tags: ['Climate', 'React', 'D3.js', 'Firebase'],
      likes: 87,
      comments: 12,
      createdAt: new Date('2025-05-10T14:20:00Z').toISOString()
    },
    {
      id: 'project_3',
      title: 'MediConnect - Healthcare Platform',
      description: 'A telemedicine platform connecting patients with healthcare providers. Features video consultations, appointment scheduling, and secure messaging.',
      imageUrl: 'https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      demoUrl: 'https://mediconnect-health.netlify.app',
      repoUrl: 'https://github.com/username/mediconnect',
      author: {
        id: 'user3',
        name: 'Dr. Michael Chen',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
      },
      category: 'healthcare',
      tags: ['Telemedicine', 'WebRTC', 'React', 'Express'],
      likes: 156,
      comments: 24,
      createdAt: new Date('2025-05-05T09:15:00Z').toISOString(),
      featured: true
    },
    {
      id: 'project_4',
      title: 'FinLit - Financial Literacy Game',
      description: 'An educational game teaching financial literacy concepts through interactive scenarios and challenges. Targeted at teenagers and young adults.',
      imageUrl: 'https://images.pexels.com/photos/6693661/pexels-photo-6693661.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      demoUrl: 'https://finlit-game.vercel.app',
      repoUrl: 'https://github.com/username/finlit',
      author: {
        id: 'user4',
        name: 'Taylor Rodriguez',
        avatar: 'https://randomuser.me/api/portraits/women/28.jpg'
      },
      category: 'education',
      tags: ['Education', 'Game', 'React', 'Three.js'],
      likes: 92,
      comments: 15,
      createdAt: new Date('2025-04-28T16:45:00Z').toISOString()
    },
    {
      id: 'project_5',
      title: 'LocalEats - Community Food Sharing',
      description: 'A platform connecting local food producers with consumers. Features include marketplace, subscription boxes, and community events calendar.',
      imageUrl: 'https://images.pexels.com/photos/5677794/pexels-photo-5677794.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      demoUrl: 'https://localeats-community.netlify.app',
      repoUrl: 'https://github.com/username/localeats',
      author: {
        id: 'user5',
        name: 'Jamie Wilson',
        avatar: 'https://randomuser.me/api/portraits/men/42.jpg'
      },
      category: 'community',
      tags: ['Food', 'Marketplace', 'React', 'Node.js', 'MongoDB'],
      likes: 78,
      comments: 9,
      createdAt: new Date('2025-04-22T11:30:00Z').toISOString()
    },
    {
      id: 'project_6',
      title: 'CodeMentor AI - Programming Assistant',
      description: 'An AI-powered programming assistant that helps developers debug code, learn new concepts, and improve their coding skills through interactive exercises.',
      imageUrl: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      demoUrl: 'https://codementor-ai.vercel.app',
      repoUrl: 'https://github.com/username/codementor-ai',
      author: {
        id: 'user6',
        name: 'Raj Patel',
        avatar: 'https://randomuser.me/api/portraits/men/55.jpg'
      },
      category: 'developer-tools',
      tags: ['AI', 'Education', 'React', 'Python', 'GPT-4'],
      likes: 215,
      comments: 32,
      createdAt: new Date('2025-04-18T08:20:00Z').toISOString(),
      featured: true
    }
  ];

  const pipeline = redis.pipeline();
  
  // Store each project
  for (const project of projects) {
    pipeline.set(`showcase:project:${project.id}`, JSON.stringify(project));
    pipeline.lpush('showcase:projects_list', project.id);
    
    // Add to category index
    pipeline.sadd(`showcase:category:${project.category}`, project.id);
    
    // Add to featured index if applicable
    if (project.featured) {
      pipeline.sadd('showcase:featured_projects', project.id);
    }
    
    // Add to tags indices
    for (const tag of project.tags) {
      pipeline.sadd(`showcase:tag:${tag.toLowerCase()}`, project.id);
    }
  }
  
  await pipeline.exec();
  console.log('Seeded showcase projects');
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
    // Seed initial data
    await seedProjects();
    await seedResources();

    const { httpMethod, path } = event;
    const pathParts = path.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];

    // Public endpoints (no auth required)
    if (httpMethod === 'GET') {
      if (action === 'projects') {
        return await getProjects(event);
      } else if (action === 'resources') {
        return await getResources(event);
      }
    }

    // Authenticated endpoints
    let userId;
    try {
      userId = await authenticateUser(event);
    } catch (authError) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: authError.message || 'Authentication required' }),
      };
    }

    // Get user data to include in responses
    const userData = await redis.get(`user:${userId}`);
    const user = userData ? (typeof userData === 'string' ? JSON.parse(userData) : userData) : null;

    if (!user) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'User not found' }),
      };
    }

    switch (httpMethod) {
      case 'POST':
        if (action === 'like') {
          return await likeProject(event, userId);
        } else if (action === 'projects') {
          return await createProject(event, userId, user);
        } else if (action === 'bookmark') {
          return await bookmarkResource(event, userId);
        } else if (action === 'resources') {
          return await submitResource(event, userId, user);
        }
        break;
      case 'PUT':
        if (pathParts.includes('projects')) {
          const projectId = pathParts[pathParts.indexOf('projects') + 1];
          if (projectId) {
            return await updateProject(event, projectId, userId);
          }
        }
        break;
      case 'DELETE':
        if (pathParts.includes('projects')) {
          const projectId = pathParts[pathParts.indexOf('projects') + 1];
          if (projectId) {
            return await deleteProject(projectId, userId);
          }
        }
        break;
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Endpoint not found' }),
    };
  } catch (error) {
    console.error('Showcase function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Internal server error' }),
    };
  }
};

// Get all projects with optional filtering
async function getProjects(event) {
  try {
    const queryParams = event.queryStringParameters || {};
    const { category, tag, featured, userId } = queryParams;

    // Get all project IDs
    let projectIds;
    
    if (featured === 'true') {
      projectIds = await redis.smembers('showcase:featured_projects');
    } else if (category && category !== 'all') {
      projectIds = await redis.smembers(`showcase:category:${category}`);
    } else if (tag) {
      projectIds = await redis.smembers(`showcase:tag:${tag.toLowerCase()}`);
    } else if (userId) {
      projectIds = await redis.smembers(`user:${userId}:projects`);
    } else {
      projectIds = await redis.lrange('showcase:projects_list', 0, -1);
    }
    
    if (!projectIds || projectIds.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: [] }),
      };
    }

    // Get all projects data
    const projectsData = await Promise.all(
      projectIds.map(async (id) => {
        const project = await redis.get(`showcase:project:${id}`);
        if (!project) return null;
        
        try {
          return typeof project === 'string' ? JSON.parse(project) : project;
        } catch (e) {
          console.error(`Failed to parse project ${id}:`, e);
          return null;
        }
      })
    );

    // Filter out null values
    const projects = projectsData.filter(project => project !== null);

    // Try to get user ID from token for like status
    let userId;
    try {
      userId = await authenticateUser(event);
      
      // If user is authenticated, check which projects they've liked
      if (userId) {
        const likedProjects = await redis.smembers(`user:${userId}:liked_projects`);
        
        // Add isLiked flag to projects
        projects.forEach(project => {
          project.isLiked = likedProjects.includes(project.id);
        });
      }
    } catch (authError) {
      // User is not authenticated, continue without like status
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: projects }),
    };
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
}

// Like or unlike a project
async function likeProject(event, userId) {
  try {
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { projectId } = requestBody;

    if (!projectId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Project ID is required' }),
      };
    }

    // Check if project exists
    const projectData = await redis.get(`showcase:project:${projectId}`);
    if (!projectData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Project not found' }),
      };
    }

    const project = typeof projectData === 'string' ? JSON.parse(projectData) : projectData;

    // Check if user already liked this project
    const alreadyLiked = await redis.sismember(`user:${userId}:liked_projects`, projectId);
    
    if (alreadyLiked) {
      // Unlike the project
      await redis.srem(`user:${userId}:liked_projects`, projectId);
      
      // Decrement likes count
      project.likes = Math.max(0, project.likes - 1);
      await redis.set(`showcase:project:${projectId}`, JSON.stringify(project));
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: true, 
          liked: false, 
          likesCount: project.likes,
          message: 'Project unliked successfully' 
        }),
      };
    } else {
      // Like the project
      await redis.sadd(`user:${userId}:liked_projects`, projectId);
      
      // Increment likes count
      project.likes += 1;
      await redis.set(`showcase:project:${projectId}`, JSON.stringify(project));
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: true, 
          liked: true, 
          likesCount: project.likes,
          message: 'Project liked successfully' 
        }),
      };
    }
  } catch (error) {
    console.error('Error liking project:', error);
    throw error;
  }
}

// Create a new project
async function createProject(event, userId, user) {
  try {
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { 
      title, 
      description, 
      imageUrl, 
      demoUrl, 
      repoUrl, 
      category, 
      tags 
    } = requestBody;

    if (!title || !description || !category) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Title, description, and category are required' }),
      };
    }

    const projectId = `project_${Date.now()}_${nanoid(8)}`;
    const now = new Date().toISOString();

    const project = {
      id: projectId,
      title,
      description,
      imageUrl: imageUrl || 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Default image
      demoUrl,
      repoUrl,
      author: {
        id: userId,
        name: user.name || user.username,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=random`
      },
      category,
      tags: Array.isArray(tags) ? tags : [],
      likes: 0,
      comments: 0,
      createdAt: now,
      updatedAt: now,
      featured: false // New projects are not featured by default
    };

    // Store project data
    await redis.set(`showcase:project:${projectId}`, JSON.stringify(project));
    
    // Add to projects list
    await redis.lpush('showcase:projects_list', projectId);
    
    // Add to user's projects
    await redis.sadd(`user:${userId}:projects`, projectId);

    // Add to category index
    await redis.sadd(`showcase:category:${category}`, projectId);

    // Add to tag indices
    for (const tag of project.tags) {
      await redis.sadd(`showcase:tag:${tag.toLowerCase()}`, projectId);
    }

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: project }),
    };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

// Update an existing project
async function updateProject(event, projectId, userId) {
  try {
    // Get project data
    const projectData = await redis.get(`showcase:project:${projectId}`);
    if (!projectData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Project not found' }),
      };
    }

    const project = typeof projectData === 'string' ? JSON.parse(projectData) : projectData;

    // Check if user is the author
    if (project.author.id !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'You can only update your own projects' }),
      };
    }

    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { 
      title, 
      description, 
      imageUrl, 
      demoUrl, 
      repoUrl, 
      category, 
      tags 
    } = requestBody;

    // Store old category and tags for index updates
    const oldCategory = project.category;
    const oldTags = project.tags || [];

    // Update project fields
    const updatedProject = {
      ...project,
      title: title || project.title,
      description: description || project.description,
      imageUrl: imageUrl || project.imageUrl,
      demoUrl: demoUrl !== undefined ? demoUrl : project.demoUrl,
      repoUrl: repoUrl !== undefined ? repoUrl : project.repoUrl,
      category: category || project.category,
      tags: tags || project.tags,
      updatedAt: new Date().toISOString()
    };

    // Update project data
    await redis.set(`showcase:project:${projectId}`, JSON.stringify(updatedProject));

    // Update category index if changed
    if (category && category !== oldCategory) {
      await redis.srem(`showcase:category:${oldCategory}`, projectId);
      await redis.sadd(`showcase:category:${category}`, projectId);
    }

    // Update tag indices if changed
    if (tags) {
      // Remove from old tag indices
      for (const tag of oldTags) {
        await redis.srem(`showcase:tag:${tag.toLowerCase()}`, projectId);
      }
      
      // Add to new tag indices
      for (const tag of tags) {
        await redis.sadd(`showcase:tag:${tag.toLowerCase()}`, projectId);
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: updatedProject }),
    };
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

// Delete a project
async function deleteProject(projectId, userId) {
  try {
    // Get project data
    const projectData = await redis.get(`showcase:project:${projectId}`);
    if (!projectData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Project not found' }),
      };
    }

    const project = typeof projectData === 'string' ? JSON.parse(projectData) : projectData;

    // Check if user is the author
    if (project.author.id !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'You can only delete your own projects' }),
      };
    }

    // Delete project data
    await redis.del(`showcase:project:${projectId}`);
    
    // Remove from projects list
    await redis.lrem('showcase:projects_list', 0, projectId);
    
    // Remove from user's projects
    await redis.srem(`user:${userId}:projects`, projectId);

    // Remove from category index
    await redis.srem(`showcase:category:${project.category}`, projectId);

    // Remove from featured index if applicable
    if (project.featured) {
      await redis.srem('showcase:featured_projects', projectId);
    }

    // Remove from tag indices
    for (const tag of project.tags) {
      await redis.srem(`showcase:tag:${tag.toLowerCase()}`, projectId);
    }

    // Remove from all users' liked projects
    // This is a simplification - in production you might want to track which users liked this project
    const likeKeys = await redis.keys('user:*:liked_projects');
    for (const key of likeKeys) {
      await redis.srem(key, projectId);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, message: 'Project deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}