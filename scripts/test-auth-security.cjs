#!/usr/bin/env node

// Security test script for the enhanced auth system
const axios = require('axios');

// Create API client similar to src/utils/api.ts
const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:8888/.netlify/functions',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testAuthSecurity() {
  console.log('🔒 Testing Enhanced Authentication Security...\n');

  const tests = {
    passwordStrength: testPasswordStrength,
    rateLimiting: testRateLimiting,
    inputValidation: testInputValidation,
    tokenSecurity: testTokenSecurity,
  };

  let passedTests = 0;
  let totalTests = Object.keys(tests).length;

  for (const [testName, testFunction] of Object.entries(tests)) {
    try {
      console.log(`📋 Running ${testName} test...`);
      await testFunction();
      console.log(`✅ ${testName} test passed\n`);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${testName} test failed: ${error.message}\n`);
    }
  }

  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 All security tests passed!');
  } else {
    console.log('⚠️  Some security tests failed. Please review the implementation.');
  }
}

async function testPasswordStrength() {
  const weakPasswords = [
    'password',
    '123456',
    'abc',
    'PASSWORD',
    'password123',
  ];

  for (const password of weakPasswords) {
    try {
      const response = await fetch('/.netlify/functions/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: password
        })
      });

      if (response.status !== 400) {
        throw new Error(`Weak password "${password}" was accepted`);
      }
    } catch (error) {
      if (error.message.includes('was accepted')) {
        throw error;
      }
      // Expected to fail, continue
    }
  }
}

async function testRateLimiting() {
  const testEmail = `ratetest${Date.now()}@example.com`;

  // Attempt multiple failed logins rapidly
  for (let i = 0; i < 6; i++) {
    try {
      const response = await fetch('/.netlify/functions/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'wrongpassword'
        })
      });

      if (i >= 5 && response.status !== 429) {
        throw new Error('Rate limiting not working properly');
      }
    } catch (error) {
      if (error.message.includes('Rate limiting')) {
        throw error;
      }
      // Expected to fail, continue
    }
  }
}

async function testInputValidation() {
  const maliciousInputs = [
    { email: '<script>alert("xss")</script>@email.com', username: 'test' },
    { email: 'test@email.com', username: '<script>alert("xss")</script>' },
    { email: 'not-an-email', username: 'test' },
    { email: 'test@email.com', username: '' },
  ];

  for (const input of maliciousInputs) {
    try {
      const response = await fetch('/.netlify/functions/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: input.username,
          email: input.email,
          password: 'StrongPassword123!'
        })
      });

      if (response.status === 201) {
        throw new Error(`Malicious input was accepted: ${JSON.stringify(input)}`);
      }
    } catch (error) {
      if (error.message.includes('was accepted')) {
        throw error;
      }
      // Expected to fail, continue
    }
  }
}

async function testTokenSecurity() {
  // Test that tokens have proper expiration
  const testUser = {
    username: `securitytest${Date.now()}`,
    email: `securitytest${Date.now()}@example.com`,
    password: 'StrongPassword123!'
  };

  try {
    // Register user using axios
    const registerResponse = await api.post('/auth/register', testUser);

    if (registerResponse.status !== 201) {
      throw new Error('Failed to register test user');
    }

    const registerData = registerResponse.data;
    const token = registerData.token;

    // Verify token structure
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Token is not a valid JWT structure');
    }

    // Decode token payload (without verification for testing)
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

    // Check token has proper fields
    if (!payload.exp || !payload.iat || !payload.sub) {
      throw new Error('Token missing required security fields');
    }

    // Check token expiration is reasonable (1 hour = 3600 seconds)
    const tokenDuration = payload.exp - payload.iat;
    if (tokenDuration > 3600) {
      throw new Error('Token expiration too long for security');
    }

  } catch (error) {
    throw new Error(`Token security test failed: ${error.message}`);
  }
}

// Run the tests if called directly
if (require.main === module) {
  testAuthSecurity().catch(console.error);
}

module.exports = { testAuthSecurity };
