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

// Seed initial resources if they don't exist
async function seedResources() {
  const resourcesExist = await redis.exists('showcase:resources_list');
  if (resourcesExist) {
    return;
  }

  const resources = [
    {
      id: 'resource_1',
      title: 'Ultimate React Starter Kit',
      description: 'A comprehensive starter template for React applications with TypeScript, Tailwind CSS, and more. Includes authentication, routing, and API integration examples.',
      url: 'https://github.com/example/react-starter-kit',
      imageUrl: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      type: 'template',
      category: 'frontend',
      tags: ['React', 'TypeScript', 'Tailwind CSS', 'Starter'],
      author: 'React Masters',
      publishedDate: new Date('2025-05-10T14:20:00Z').toISOString(),
      featured: true,
      stars: 1245,
      isFree: true
    },
    {
      id: 'resource_2',
      title: 'Building AI-Powered Applications',
      description: 'Learn how to integrate AI capabilities into your web applications using modern JavaScript frameworks and APIs.',
      url: 'https://example.com/ai-powered-apps',
      imageUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      type: 'course',
      category: 'ai',
      tags: ['AI', 'JavaScript', 'API', 'Machine Learning'],
      author: 'AI Academy',
      publishedDate: new Date('2025-05-05T09:15:00Z').toISOString(),
      stars: 487,
      isFree: false
    },
    {
      id: 'resource_3',
      title: 'Serverless Architecture Patterns',
      description: 'A comprehensive guide to serverless architecture patterns and best practices for modern web applications.',
      url: 'https://example.com/serverless-patterns',
      imageUrl: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      type: 'article',
      category: 'backend',
      tags: ['Serverless', 'AWS', 'Architecture', 'Cloud'],
      author: 'Cloud Experts',
      publishedDate: new Date('2025-04-28T16:45:00Z').toISOString(),
      featured: true,
      isFree: true
    },
    {
      id: 'resource_4',
      title: 'Modern UI Design Principles',
      description: 'Learn the fundamental principles of modern UI design and how to apply them to create beautiful, user-friendly interfaces.',
      url: 'https://example.com/ui-design-principles',
      imageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      type: 'video',
      category: 'design',
      tags: ['UI', 'Design', 'UX', 'Principles'],
      author: 'Design Masters',
      publishedDate: new Date('2025-04-22T11:30:00Z').toISOString(),
      stars: 892,
      isFree: true
    },
    {
      id: 'resource_5',
      title: 'Database Optimization Techniques',
      description: 'Advanced techniques for optimizing database performance in high-traffic web applications.',
      url: 'https://example.com/database-optimization',
      imageUrl: 'https://images.pexels.com/photos/325111/pexels-photo-325111.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      type: 'book',
      category: 'database',
      tags: ['Database', 'Performance', 'SQL', 'NoSQL'],
      author: 'DB Experts',
      publishedDate: new Date('2025-04-18T08:20:00Z').toISOString(),
      stars: 356,
      isFree: false
    },
    {
      id: 'resource_6',
      title: 'Web3 Development Toolkit',
      description: 'A comprehensive toolkit for building decentralized applications on the blockchain.',
      url: 'https://example.com/web3-toolkit',
      imageUrl: 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      type: 'tool',
      category: 'web3',
      tags: ['Web3', 'Blockchain', 'Ethereum', 'Smart Contracts'],
      author: 'Blockchain Devs',
      publishedDate: new Date('2025-04-15T10:30:00Z').toISOString(),
      featured: true,
      stars: 723,
      isFree: true
    },
    {
      id: 'resource_7',
      title: 'The Future of Web Development',
      description: 'A podcast series exploring emerging trends and technologies in web development.',
      url: 'https://example.com/future-web-dev-podcast',
      imageUrl: 'https://images.pexels.com/photos/3944311/pexels-photo-3944311.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      type: 'podcast',
      category: 'trends',
      tags: ['Podcast', 'Trends', 'Future', 'Web Development'],
      author: 'Tech Visionaries',
      publishedDate: new Date('2025-04-10T14:45:00Z').toISOString(),
      isFree: true
    },
    {
      id: 'resource_8',
      title: 'Advanced Animation Library',
      description: 'A powerful JavaScript library for creating complex animations with minimal code.',
      url: 'https://example.com/animation-library',
      imageUrl: 'https://images.pexels.com/photos/2777898/pexels-photo-2777898.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      type: 'library',
      category: 'frontend',
      tags: ['Animation', 'JavaScript', 'Library', 'UI'],
      author: 'Animation Experts',
      publishedDate: new Date('2025-04-05T09:20:00Z').toISOString(),
      stars: 1876,
      isFree: true
    }
  ];

  const pipeline = redis.pipeline();
  
  // Store each resource
  for (const resource of resources) {
    pipeline.set(`showcase:resource:${resource.id}`, JSON.stringify(resource));
    pipeline.lpush('showcase:resources_list', resource.id);
    
    // Add to category index
    pipeline.sadd(`showcase:resource_category:${resource.category}`, resource.id);
    
    // Add to type index
    pipeline.sadd(`showcase:resource_type:${resource.type}`, resource.id);
    
    // Add to featured index if applicable
    if (resource.featured) {
      pipeline.sadd('showcase:featured_resources', resource.id);
    }
    
    // Add to free/paid indices
    if (resource.isFree) {
      pipeline.sadd('showcase:free_resources', resource.id);
    } else {
      pipeline.sadd('showcase:paid_resources', resource.id);
    }
    
    // Add to tags indices
    for (const tag of resource.tags) {
      pipeline.sadd(`showcase:resource_tag:${tag.toLowerCase()}`, resource.id);
    }
  }
  
  await pipeline.exec();
  console.log('Seeded showcase resources');
}

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

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.sub || decoded.userId; // Use 'sub' field which contains the user ID
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    throw new Error('Invalid token');
  }
}

// Get all resources with optional filtering
async function getResources(event) {
  try {
    // Seed resources if they don't exist
    await seedResources();
    
    const queryParams = event.queryStringParameters || {};
    const { category, type, featured, free, tag } = queryParams;

    // Get all resource IDs
    let resourceIds;
    
    if (featured === 'true') {
      resourceIds = await redis.smembers('showcase:featured_resources');
    } else if (category && category !== 'all') {
      resourceIds = await redis.smembers(`showcase:resource_category:${category}`);
    } else if (type && type !== 'all') {
      resourceIds = await redis.smembers(`showcase:resource_type:${type}`);
    } else if (free === 'true') {
      resourceIds = await redis.smembers('showcase:free_resources');
    } else if (tag) {
      resourceIds = await redis.smembers(`showcase:resource_tag:${tag.toLowerCase()}`);
    } else {
      resourceIds = await redis.lrange('showcase:resources_list', 0, -1);
    }
    
    if (!resourceIds || resourceIds.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: [] }),
      };
    }

    // Get all resources data
    const resourcesData = await Promise.all(
      resourceIds.map(async (id) => {
        const resource = await redis.get(`showcase:resource:${id}`);
        if (!resource) return null;
        
        try {
          return typeof resource === 'string' ? JSON.parse(resource) : resource;
        } catch (e) {
          console.error(`Failed to parse resource ${id}:`, e);
          return null;
        }
      })
    );

    // Filter out null values
    const resources = resourcesData.filter(resource => resource !== null);

    // Try to get user ID from token for bookmark status
    let userId;
    try {
      userId = await authenticateUser(event);
      
      // If user is authenticated, check which resources they've bookmarked
      if (userId) {
        const bookmarkedResources = await redis.smembers(`user:${userId}:bookmarked_resources`);
        
        // Add isBookmarked flag to resources
        resources.forEach(resource => {
          resource.isBookmarked = bookmarkedResources.includes(resource.id);
        });
      }
    } catch (authError) {
      // User is not authenticated, continue without bookmark status
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: resources }),
    };
  } catch (error) {
    console.error('Error getting resources:', error);
    throw error;
  }
}

// Bookmark or unbookmark a resource
async function bookmarkResource(event, userId) {
  try {
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { resourceId } = requestBody;

    if (!resourceId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Resource ID is required' }),
      };
    }

    // Check if resource exists
    const resourceData = await redis.get(`showcase:resource:${resourceId}`);
    if (!resourceData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Resource not found' }),
      };
    }

    // Check if user already bookmarked this resource
    const alreadyBookmarked = await redis.sismember(`user:${userId}:bookmarked_resources`, resourceId);
    
    if (alreadyBookmarked) {
      // Remove bookmark
      await redis.srem(`user:${userId}:bookmarked_resources`, resourceId);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: true, 
          bookmarked: false, 
          message: 'Resource unbookmarked successfully' 
        }),
      };
    } else {
      // Add bookmark
      await redis.sadd(`user:${userId}:bookmarked_resources`, resourceId);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: true, 
          bookmarked: true, 
          message: 'Resource bookmarked successfully' 
        }),
      };
    }
  } catch (error) {
    console.error('Error bookmarking resource:', error);
    throw error;
  }
}

// Submit a new resource
async function submitResource(event, userId, user) {
  try {
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { 
      title, 
      description, 
      url, 
      imageUrl, 
      type, 
      category, 
      tags, 
      isFree 
    } = requestBody;

    if (!title || !description || !url || !type || !category) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Title, description, URL, type, and category are required' }),
      };
    }

    const resourceId = `resource_${Date.now()}_${nanoid(8)}`;
    const now = new Date().toISOString();

    const resource = {
      id: resourceId,
      title,
      description,
      url,
      imageUrl: imageUrl || '',
      type,
      category,
      tags: Array.isArray(tags) ? tags : [],
      author: user.name || user.username,
      publishedDate: now,
      featured: false, // New resources are not featured by default
      stars: 0,
      isFree: !!isFree
    };

    // Store resource data
    await redis.set(`showcase:resource:${resourceId}`, JSON.stringify(resource));
    
    // Add to resources list
    await redis.lpush('showcase:resources_list', resourceId);
    
    // Add to user's submitted resources
    await redis.sadd(`user:${userId}:submitted_resources`, resourceId);

    // Add to category index
    await redis.sadd(`showcase:resource_category:${category}`, resourceId);

    // Add to type index
    await redis.sadd(`showcase:resource_type:${type}`, resourceId);

    // Add to free/paid indices
    if (isFree) {
      await redis.sadd('showcase:free_resources', resourceId);
    } else {
      await redis.sadd('showcase:paid_resources', resourceId);
    }

    // Add to tag indices
    for (const tag of resource.tags) {
      await redis.sadd(`showcase:resource_tag:${tag.toLowerCase()}`, resourceId);
    }

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: resource }),
    };
  } catch (error) {
    console.error('Error submitting resource:', error);
    throw error;
  }
}

module.exports = {
  getResources,
  bookmarkResource,
  submitResource,
  seedResources
};