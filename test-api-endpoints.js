import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Helper function to make authenticated requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  
  return {
    status: response.status,
    statusText: response.statusText,
    data
  };
}

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(endpoint, method, status, expected, actual) {
  const passed = status === expected;
  const result = {
    endpoint,
    method,
    expected,
    actual: status,
    passed,
    timestamp: new Date().toISOString()
  };
  
  results.tests.push(result);
  if (passed) {
    results.passed++;
    console.log(`✅ ${method} ${endpoint} - ${status}`);
  } else {
    results.failed++;
    console.log(`❌ ${method} ${endpoint} - Expected: ${expected}, Got: ${status}`);
  }
  
  return result;
}

async function testEndpoints() {
  console.log('🔍 Testing Real Estate CRM API Endpoints\n');
  
  // Test unauthenticated endpoints (should return 401)
  console.log('--- Testing Authentication (should be 401) ---');
  let result = await makeRequest('/api/auth/user');
  logTest('/api/auth/user', 'GET', result.status, 401);
  
  result = await makeRequest('/api/dashboard/metrics');
  logTest('/api/dashboard/metrics', 'GET', result.status, 401);
  
  result = await makeRequest('/api/analytics/detailed');
  logTest('/api/analytics/detailed', 'GET', result.status, 401);
  
  // Test Lead endpoints (unauthenticated)
  console.log('\n--- Testing Lead Endpoints (unauthenticated) ---');
  result = await makeRequest('/api/leads');
  logTest('/api/leads', 'GET', result.status, 401);
  
  result = await makeRequest('/api/leads/test-id');
  logTest('/api/leads/:id', 'GET', result.status, 401);
  
  result = await makeRequest('/api/leads', {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'User'
    })
  });
  logTest('/api/leads', 'POST', result.status, 401);
  
  // Test Property endpoints (unauthenticated)
  console.log('\n--- Testing Property Endpoints (unauthenticated) ---');
  result = await makeRequest('/api/properties');
  logTest('/api/properties', 'GET', result.status, 401);
  
  result = await makeRequest('/api/properties/test-id');
  logTest('/api/properties/:id', 'GET', result.status, 401);
  
  result = await makeRequest('/api/properties', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Test Property',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      propertyType: 'house',
      price: 100000
    })
  });
  logTest('/api/properties', 'POST', result.status, 401);
  
  // Test Deal endpoints (unauthenticated)
  console.log('\n--- Testing Deal Endpoints (unauthenticated) ---');
  result = await makeRequest('/api/deals');
  logTest('/api/deals', 'GET', result.status, 401);
  
  result = await makeRequest('/api/deals/test-id');
  logTest('/api/deals/:id', 'GET', result.status, 401);
  
  result = await makeRequest('/api/deals', {
    method: 'POST',
    body: JSON.stringify({
      leadId: 'test-lead-id',
      stage: 'inquiry',
      dealValue: 50000
    })
  });
  logTest('/api/deals', 'POST', result.status, 401);
  
  // Test Task endpoints (unauthenticated)
  console.log('\n--- Testing Task Endpoints (unauthenticated) ---');
  result = await makeRequest('/api/tasks');
  logTest('/api/tasks', 'GET', result.status, 401);
  
  result = await makeRequest('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Test Task',
      type: 'call'
    })
  });
  logTest('/api/tasks', 'POST', result.status, 401);
  
  // Test Communication endpoints (unauthenticated)
  console.log('\n--- Testing Communication Endpoints (unauthenticated) ---');
  result = await makeRequest('/api/communications');
  logTest('/api/communications', 'GET', result.status, 401);
  
  result = await makeRequest('/api/communications/campaigns');
  logTest('/api/communications/campaigns', 'GET', result.status, 401);
  
  result = await makeRequest('/api/communications/templates');
  logTest('/api/communications/templates', 'GET', result.status, 401);
  
  // Test Notification endpoints (unauthenticated)
  console.log('\n--- Testing Notification Endpoints (unauthenticated) ---');
  result = await makeRequest('/api/notifications');
  logTest('/api/notifications', 'GET', result.status, 401);
  
  result = await makeRequest('/api/notifications/unread-count');
  logTest('/api/notifications/unread-count', 'GET', result.status, 401);
  
  // Test AI endpoints (unauthenticated)
  console.log('\n--- Testing AI Endpoints (unauthenticated) ---');
  result = await makeRequest('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: 'Test message'
    })
  });
  logTest('/api/ai/chat', 'POST', result.status, 401);
  
  result = await makeRequest('/api/ai/insights');
  logTest('/api/ai/insights', 'GET', result.status, 401);
  
  result = await makeRequest('/api/ai/generate-message', {
    method: 'POST',
    body: JSON.stringify({
      leadId: 'test-id',
      type: 'email',
      purpose: 'follow_up'
    })
  });
  logTest('/api/ai/generate-message', 'POST', result.status, 401);
  
  result = await makeRequest('/api/ai/property-match', {
    method: 'POST',
    body: JSON.stringify({
      leadId: 'test-id'
    })
  });
  logTest('/api/ai/property-match', 'POST', result.status, 401);
  
  // Test Object Storage endpoints (unauthenticated)
  console.log('\n--- Testing Object Storage Endpoints (unauthenticated) ---');
  result = await makeRequest('/api/objects/signed-url', {
    method: 'POST',
    body: JSON.stringify({
      fileName: 'test.jpg',
      fileType: 'image/jpeg'
    })
  });
  logTest('/api/objects/signed-url', 'POST', result.status, 401);
  
  // Test public endpoints (should work without auth)
  console.log('\n--- Testing Public Endpoints ---');
  result = await makeRequest('/api/docs.json');
  logTest('/api/docs.json', 'GET', result.status, 200);
  
  // Test non-existent endpoints
  console.log('\n--- Testing Non-existent Endpoints ---');
  result = await makeRequest('/api/nonexistent');
  logTest('/api/nonexistent', 'GET', result.status, 404);
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📋 Total: ${results.tests.length}`);
  console.log(`🎯 Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
  
  return results;
}

// Run tests
testEndpoints().catch(console.error);