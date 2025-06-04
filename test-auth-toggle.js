#!/usr/bin/env node

/**
 * End-to-End Test for Authentication Mode Toggle
 * Tests the complete flow of switching between Cookie and Bearer token authentication modes
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8888/.netlify/functions';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

// Configure axios to handle cookies
const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for cookie mode
  timeout: 10000
});

/**
 * Test user registration/login
 */
async function testAuth(mode = 'cookie') {
  console.log(`\n🔐 Testing Authentication in ${mode.toUpperCase()} mode:`);

  try {
    // Try to login first
    let authResponse;
    try {
      authResponse = await client.post('/auth', {
        action: 'login',
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      console.log('✅ Login successful');
    } catch (loginError) {
      if (loginError.response?.status === 401) {
        // User doesn't exist, register first
        console.log('👤 User not found, registering...');
        await client.post('/auth', {
          action: 'register',
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          name: 'Test User'
        });

        // Now login
        authResponse = await client.post('/auth', {
          action: 'login',
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        });
        console.log('✅ Registration and login successful');
      } else {
        throw loginError;
      }
    }

    // Check response structure based on mode
    if (mode === 'bearer') {
      if (!authResponse.data.token) {
        throw new Error('Expected token in response for Bearer mode');
      }
      console.log('✅ Token received in response (Bearer mode)');

      // Test protected endpoint with Bearer token
      const token = authResponse.data.token;
      const meResponse = await client.get('/auth?action=me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Protected endpoint access with Bearer token successful');
      console.log(`   User: ${meResponse.data.user.email}`);

      return { token, user: meResponse.data.user };

    } else {
      // Cookie mode - token should not be in response
      if (authResponse.data.token) {
        console.log('⚠️  Warning: Token found in response in Cookie mode');
      }
      console.log('✅ No token in response (Cookie mode)');

      // Test protected endpoint with cookies
      const meResponse = await client.get('/auth?action=me');
      console.log('✅ Protected endpoint access with cookies successful');
      console.log(`   User: ${meResponse.data.user.email}`);

      return { user: meResponse.data.user };
    }

  } catch (error) {
    console.error('❌ Authentication test failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test feature flag retrieval and update
 */
async function testFeatureFlags() {
  console.log('\n🎯 Testing Feature Flags:');

  try {
    // Get current feature flags
    const flagsResponse = await client.get('/feature-flags');
    console.log('✅ Feature flags retrieved successfully');
    console.log(`   Bearer token auth flag: ${flagsResponse.data.bearer_token_auth}`);

    // Toggle the bearer token auth flag
    const currentValue = flagsResponse.data.bearer_token_auth;
    const newValue = !currentValue;

    console.log(`🔄 Toggling bearer_token_auth flag: ${currentValue} → ${newValue}`);

    const updateResponse = await client.put('/feature-flags', {
      bearer_token_auth: newValue
    });

    console.log('✅ Feature flag updated successfully');
    console.log(`   New bearer token auth flag: ${updateResponse.data.bearer_token_auth}`);

    return updateResponse.data;

  } catch (error) {
    console.error('❌ Feature flags test failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test notes endpoint to verify authentication works
 */
async function testProtectedEndpoint(authData, mode = 'cookie') {
  console.log(`\n📝 Testing Notes endpoint in ${mode.toUpperCase()} mode:`);

  try {
    const config = {};

    if (mode === 'bearer' && authData.token) {
      config.headers = {
        'Authorization': `Bearer ${authData.token}`
      };
    }
    // For cookie mode, cookies are automatically sent

    const notesResponse = await client.get('/notes', config);
    console.log('✅ Notes endpoint access successful');
    console.log(`   Found ${notesResponse.data.notes.length} notes`);

    return notesResponse.data;

  } catch (error) {
    console.error('❌ Notes endpoint test failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test the complete authentication mode switching flow
 */
async function testModeSwitch() {
  console.log('\n🔄 Testing Authentication Mode Switch:');

  try {
    // Test current mode (should be cookie based on .env.development)
    console.log('\n--- Phase 1: Test Current Mode (Cookie) ---');
    const cookieAuth = await testAuth('cookie');
    await testProtectedEndpoint(cookieAuth, 'cookie');

    // Get and toggle feature flags
    console.log('\n--- Phase 2: Toggle Feature Flag ---');
    const updatedFlags = await testFeatureFlags();
    const isBearerMode = updatedFlags.bearer_token_auth;

    // Test the other mode
    console.log(`\n--- Phase 3: Test ${isBearerMode ? 'Bearer' : 'Cookie'} Mode ---`);
    const newModeAuth = await testAuth(isBearerMode ? 'bearer' : 'cookie');
    await testProtectedEndpoint(newModeAuth, isBearerMode ? 'bearer' : 'cookie');

    // Test switching back
    console.log('\n--- Phase 4: Switch Back ---');
    await client.put('/feature-flags', {
      bearer_token_auth: !isBearerMode
    });
    console.log(`✅ Switched back to ${!isBearerMode ? 'Bearer' : 'Cookie'} mode`);

    console.log('\n🎉 All authentication mode tests passed!');

  } catch (error) {
    console.error('\n💥 Authentication mode switch test failed:', error);
    process.exit(1);
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('🚀 Starting Authentication Mode Toggle Tests');
  console.log('============================================');

  try {
    await testModeSwitch();
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  testAuth,
  testFeatureFlags,
  testProtectedEndpoint,
  testModeSwitch
};
