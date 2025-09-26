// Simple API test script
const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🚀 Starting API tests...\n');
  
  // Test 1: Register a new user
  console.log('1️⃣ Testing user registration...');
  try {
    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        name: 'Test User'
      })
    });
    
    const registerData = await registerRes.json();
    if (registerRes.ok) {
      console.log('✅ Registration successful:', registerData.user.username);
      const token = registerData.token;
      
      // Test 2: Get current user
      console.log('\n2️⃣ Testing get current user...');
      const meRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const meData = await meRes.json();
      if (meRes.ok) {
        console.log('✅ Got user data:', meData.user.username);
      } else {
        console.log('❌ Failed to get user:', meData.error);
      }
      
      // Test 3: Get all models
      console.log('\n3️⃣ Testing get all models...');
      const modelsRes = await fetch(`${API_BASE}/models`);
      const modelsData = await modelsRes.json();
      if (modelsRes.ok) {
        console.log('✅ Got models:', modelsData.models.length, 'models');
      } else {
        console.log('❌ Failed to get models:', modelsData.error);
      }
      
    } else {
      console.log('❌ Registration failed:', registerData.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n✨ API tests completed!');
}

// Run tests if server is running
console.log('Make sure the server is running on port 3000');
console.log('You can start it with: pnpm dev\n');

// Uncomment to run tests:
// testAPI();
