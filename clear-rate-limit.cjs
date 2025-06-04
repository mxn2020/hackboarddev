#!/usr/bin/env node

require('dotenv').config({ path: '.env.development' });
const { Redis } = require('@upstash/redis');

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function clearRateLimit() {
  try {
    // Clear registration rate limits (common IP patterns)
    await redis.del('rate_limit:register:127.0.0.1');
    await redis.del('rate_limit:register:::1');
    await redis.del('rate_limit:register:localhost');
    await redis.del('rate_limit:register:unknown');

    // Clear login rate limits
    await redis.del('rate_limit:login:ip:127.0.0.1');
    await redis.del('rate_limit:login:ip:::1');
    await redis.del('rate_limit:login:ip:localhost');
    await redis.del('rate_limit:login:ip:unknown');

    // Clear any email-based login rate limits for test emails
    await redis.del('rate_limit:login:email:test@example.com');
    await redis.del('rate_limit:login:email:user@example.com');
    await redis.del('rate_limit:login:email:admin@example.com');
    await redis.del('rate_limit:login:email:newuser456@example.com');

    console.log('✅ Rate limits cleared successfully!');
    console.log('You can now test registration and login endpoints again.');
  } catch (error) {
    console.error('❌ Error clearing rate limits:', error);
  }
}

clearRateLimit();
