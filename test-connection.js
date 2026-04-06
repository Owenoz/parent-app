/**
 * Test script to verify StudentApp can connect to LMS backend
 * Run with: node test-connection.js
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
const HEALTH_URL = API_BASE_URL.replace('/api/v1', '/api/health');

console.log('🔍 Testing LMS Backend Connection');
console.log('==================================\n');

async function testConnection() {
  const tests = [];

  // Test 1: Health Check
  console.log('1️⃣  Testing health endpoint...');
  try {
    const response = await axios.get(HEALTH_URL, { timeout: 5000 });
    if (response.status === 200) {
      console.log('   ✅ Health check passed');
      tests.push({ name: 'Health Check', passed: true });
    } else {
      console.log(`   ❌ Health check failed: ${response.status}`);
      tests.push({ name: 'Health Check', passed: false, error: `Status ${response.status}` });
    }
  } catch (error) {
    console.log(`   ❌ Health check failed: ${error.message}`);
    tests.push({ name: 'Health Check', passed: false, error: error.message });
  }

  // Test 2: Public Courses Endpoint
  console.log('\n2️⃣  Testing public courses endpoint...');
  try {
    const response = await axios.get(`${API_BASE_URL}/public/courses`, { timeout: 5000 });
    if (response.status === 200) {
      console.log('   ✅ Public courses endpoint accessible');
      tests.push({ name: 'Public Courses', passed: true });
    } else {
      console.log(`   ❌ Public courses failed: ${response.status}`);
      tests.push({ name: 'Public Courses', passed: false, error: `Status ${response.status}` });
    }
  } catch (error) {
    console.log(`   ⚠️  Public courses endpoint: ${error.message}`);
    tests.push({ name: 'Public Courses', passed: false, error: error.message });
  }

  // Test 3: Register Test User
  console.log('\n3️⃣  Testing user registration...');
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  let testToken = null;
  let testUserId = null;

  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/register`,
      {
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User'
      },
      { timeout: 5000 }
    );

    if (response.data.success) {
      testToken = response.data.data.accessToken;
      testUserId = response.data.data.user.id;
      console.log('   ✅ User registration successful');
      console.log(`   📧 Test user: ${testEmail}`);
      tests.push({ name: 'User Registration', passed: true });
    } else {
      console.log(`   ❌ Registration failed: ${response.data.error?.message}`);
      tests.push({ name: 'User Registration', passed: false, error: response.data.error?.message });
    }
  } catch (error) {
    console.log(`   ❌ Registration failed: ${error.response?.data?.error?.message || error.message}`);
    tests.push({ name: 'User Registration', passed: false, error: error.message });
  }

  // Test 4: Login
  if (testToken) {
    console.log('\n4️⃣  Testing login...');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          email: testEmail,
          password: testPassword
        },
        { timeout: 5000 }
      );

      if (response.data.success) {
        console.log('   ✅ Login successful');
        tests.push({ name: 'Login', passed: true });
      } else {
        console.log(`   ❌ Login failed: ${response.data.error?.message}`);
        tests.push({ name: 'Login', passed: false, error: response.data.error?.message });
      }
    } catch (error) {
      console.log(`   ❌ Login failed: ${error.response?.data?.error?.message || error.message}`);
      tests.push({ name: 'Login', passed: false, error: error.message });
    }
  }

  // Test 5: Protected Endpoint (Get Profile)
  if (testToken) {
    console.log('\n5️⃣  Testing protected endpoint (auth/me)...');
    try {
      const response = await axios.get(
        `${API_BASE_URL}/auth/me`,
        {
          headers: { Authorization: `Bearer ${testToken}` },
          timeout: 5000
        }
      );

      if (response.data.success) {
        console.log('   ✅ Protected endpoint accessible');
        console.log(`   👤 User: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`);
        tests.push({ name: 'Protected Endpoint', passed: true });
      } else {
        console.log(`   ❌ Protected endpoint failed: ${response.data.error?.message}`);
        tests.push({ name: 'Protected Endpoint', passed: false, error: response.data.error?.message });
      }
    } catch (error) {
      console.log(`   ❌ Protected endpoint failed: ${error.response?.data?.error?.message || error.message}`);
      tests.push({ name: 'Protected Endpoint', passed: false, error: error.message });
    }
  }

  // Test 6: Logout
  if (testToken) {
    console.log('\n6️⃣  Testing logout...');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${testToken}` },
          timeout: 5000
        }
      );

      if (response.data.success) {
        console.log('   ✅ Logout successful');
        tests.push({ name: 'Logout', passed: true });
      } else {
        console.log(`   ❌ Logout failed: ${response.data.error?.message}`);
        tests.push({ name: 'Logout', passed: false, error: response.data.error?.message });
      }
    } catch (error) {
      console.log(`   ❌ Logout failed: ${error.response?.data?.error?.message || error.message}`);
      tests.push({ name: 'Logout', passed: false, error: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));

  const passed = tests.filter(t => t.passed).length;
  const failed = tests.filter(t => !t.passed).length;

  tests.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    console.log(`${status} ${test.name}`);
    if (!test.passed && test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('\n🎉 All tests passed! StudentApp is ready to connect to LMS backend.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the backend configuration.');
    console.log('\nTroubleshooting:');
    console.log('1. Ensure backend is running: cd "LMS-main (2)" && npm run dev');
    console.log('2. Check API_BASE_URL in StudentApp/.env');
    console.log('3. Verify database is running and migrated');
    console.log('4. Check backend logs for errors');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
testConnection().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
