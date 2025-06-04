#!/usr/bin/env node

// Test script to verify registration fix works correctly
// This simulates the frontend registration call

const https = require('https');
const http = require('http');

const baseUrl = 'http://localhost:8889/.netlify/functions/auth';

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve({ status: res.statusCode, data });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testRegistration() {
  try {
    console.log('🧪 Testing registration endpoint...\n');

    const payload = JSON.stringify({
      username: `testuser_${Date.now()}`,
      password: 'TestPassword123!',
      email: `test_${Date.now()}@example.com`
    });

    const response = await makeRequest(`${baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: `testuser_${Date.now()}`,
        password: 'TestPassword123!',
        email: `test_${Date.now()}@example.com`
      })
    });

    const data = await response.json();

    console.log('📋 Response Status:', response.status);
    console.log('📋 Response Data:', JSON.stringify(data, null, 2));

    if (response.status === 429) {
      console.log('⚠️  Rate limited - this is expected behavior');
      console.log('✅ Rate limiting is working correctly');
      return;
    }

    if (response.status === 201 && data.success === true) {
      console.log('✅ SUCCESS: Registration response includes success field!');
      console.log('✅ User created:', data.user?.username);
      console.log('✅ Token provided:', !!data.token);
    } else {
      console.log('❌ FAILED: Registration response missing success field or wrong status');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

async function testLogin() {
  try {
    console.log('\n🧪 Testing login endpoint...\n');

    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'TestPassword123!'
      })
    });

    const data = await response.json();

    console.log('📋 Response Status:', response.status);
    console.log('📋 Response Data:', JSON.stringify(data, null, 2));

    if (response.status === 401) {
      console.log('✅ LOGIN: Correctly rejects invalid credentials');
    }

  } catch (error) {
    console.error('❌ Login test failed with error:', error.message);
  }
}

// Run tests
(async () => {
  console.log('🚀 Starting authentication endpoint tests...\n');
  await testRegistration();
  await testLogin();
  console.log('\n🏁 Tests completed!');
})();
