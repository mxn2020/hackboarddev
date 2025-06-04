#!/usr/bin/env node

/**
 * Simple Authentication Mode Test Script
 * Tests login and feature flag toggling
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8888/.netlify/functions';
const TEST_EMAIL = 'testuser@example.com';
const TEST_PASSWORD = 'TestPassword123!';

// Configure axios to handle cookies
const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000
});

async function registerUser() {
  try {
    console.log('🔐 Registering new user...');
    const response = await client.post('/auth/register', {
      username: 'testuser',
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    console.log('✅ Registration successful');
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️  User already exists, proceeding with login...');
      return null;
    }
    throw error;
  }
}

async function loginUser() {
  try {
    console.log('🔑 Logging in...');
    const response = await client.post('/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    console.log('✅ Login successful');
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testFeatureFlags() {
  try {
    console.log('\n🎯 Getting current feature flags...');
    const flagsResponse = await client.get('/feature-flags');
    console.log('✅ Feature flags retrieved');

    // Look for bearer_token_auth flag
    const flags = flagsResponse.data.data || [];
    const bearerFlag = flags.find(flag => flag.id === 'bearer_token_auth');

    if (bearerFlag) {
      console.log(`   Bearer token auth flag: ${bearerFlag.enabled}`);
    } else {
      console.log('   Bearer token auth flag not found in response');
    }

    return flagsResponse.data;
  } catch (error) {
    console.error('❌ Feature flags test failed:', error.response?.data || error.message);
    throw error;
  }
}

async function toggleBearerTokenAuth(enabled) {
  try {
    console.log(`\n🔄 Setting bearer_token_auth to ${enabled}...`);
    const response = await client.put('/feature-flags', {
      bearer_token_auth: enabled
    });
    console.log('✅ Feature flag updated successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Feature flag update failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testAuthentication() {
  try {
    console.log('\n🔍 Testing authentication endpoint...');
    const response = await client.get('/auth/me');
    console.log('✅ Authentication test successful');
    console.log(`   User: ${response.data.user.email}`);
    return response.data;
  } catch (error) {
    console.error('❌ Authentication test failed:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Authentication Mode Toggle Test');
  console.log('=============================================');

  try {
    // Step 1: Register or login
    await registerUser();
    await loginUser();

    // Step 2: Test authentication
    await testAuthentication();

    // Step 3: Get current feature flags
    await testFeatureFlags();

    // Step 4: Toggle bearer token auth on
    await toggleBearerTokenAuth(true);

    // Step 5: Get updated feature flags
    await testFeatureFlags();

    // Step 6: Toggle bearer token auth off
    await toggleBearerTokenAuth(false);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
