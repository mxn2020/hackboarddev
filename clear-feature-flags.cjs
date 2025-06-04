#!/usr/bin/env node

/**
 * Clear Feature Flags Cache
 * Forces re-initialization of feature flags with updated DEFAULT_FEATURE_FLAGS
 */

require('dotenv').config({ path: '.env.development' });

const { Redis } = require('@upstash/redis');

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function clearFeatureFlagsCache() {
  try {
    console.log('🗑️  Clearing feature flags cache...');

    // Delete the existing feature flags from Redis
    const result = await redis.del('feature_flags');

    console.log('✅ Feature flags cache cleared successfully!');
    console.log(`   Deleted ${result} key(s) from Redis`);
    console.log('   Next request to /feature-flags will re-initialize with updated flags');

  } catch (error) {
    console.error('❌ Failed to clear feature flags cache:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  clearFeatureFlagsCache();
}

module.exports = { clearFeatureFlagsCache };
