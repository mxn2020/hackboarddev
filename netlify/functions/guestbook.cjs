const { Redis } = require('@upstash/redis');

let redis;
try {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('Redis configuration missing');
  }
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} catch (error) {
  console.error('Redis initialization failed for guestbook:', error);
}

const redisKey = 'example:guestbook_entries';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.URL || 'http://localhost:8888',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (!redis) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Redis not available' }) };
  }

  try {
    if (event.httpMethod === 'GET') {
      const entries = await redis.lrange(redisKey, 0, 49); // Get latest 50
      const parsedEntries = entries.map(entry => {
        if (typeof entry === 'string') {
          return JSON.parse(entry);
        }
        return entry; // Already an object
      });
      return { 
        statusCode: 200, 
        headers, 
        body: JSON.stringify({ success: true, data: parsedEntries }) 
      };
    } else if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      if (!body.name || !body.message) {
        return { 
          statusCode: 400, 
          headers, 
          body: JSON.stringify({ success: false, error: 'Name and message are required.' }) 
        };
      }
      const entry = { 
        name: body.name, 
        message: body.message, 
        timestamp: new Date().toISOString() 
      };
      await redis.lpush(redisKey, JSON.stringify(entry));
      await redis.ltrim(redisKey, 0, 99); // Keep only the latest 100 entries
      return { 
        statusCode: 201, 
        headers, 
        body: JSON.stringify({ success: true, data: entry }) 
      };
    }
    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' }) 
    };
  } catch (error) {
    console.error('Guestbook function error:', error);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ success: false, error: 'Internal server error' }) 
    };
  }
};
