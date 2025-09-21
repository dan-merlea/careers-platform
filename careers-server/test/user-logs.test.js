const axios = require('axios');
const { MongoClient } = require('mongodb');

// Configuration
const API_URL = 'http://localhost:3000';
const MONGO_URI = 'mongodb://localhost:27017/dev_careers';
const TEST_USER_TOKEN = 'YOUR_JWT_TOKEN'; // Replace with a valid JWT token for testing

// MongoDB client
let client;
let db;

// Test data
const testJobApplication = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '1234567890',
  jobId: '60d0fe4f5311236168a109ca', // Replace with a valid job ID
  consentDuration: 6
};

// Setup and teardown
async function setup() {
  // Connect to MongoDB
  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db();
  console.log('Connected to MongoDB');
  
  // Clear existing test logs
  await db.collection('userlogs').deleteMany({
    'details.path': { $regex: '/test/' }
  });
}

async function teardown() {
  // Close MongoDB connection
  if (client) {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Helper functions
function createAxiosConfig() {
  return {
    headers: {
      'Authorization': `Bearer ${TEST_USER_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
}

async function checkLogs(action, resourceType) {
  // Wait a moment for logs to be written
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if logs were created
  const logs = await db.collection('userlogs').find({
    action,
    resourceType
  }).toArray();
  
  console.log(`Found ${logs.length} logs for action: ${action}, resourceType: ${resourceType}`);
  return logs.length > 0;
}

// Test functions
async function testCreateApplicationLog() {
  console.log('Testing create application log...');
  try {
    // This would normally include a file upload, but we'll skip that for this test
    // In a real test, you would use FormData and include a file
    const response = await axios.post(`${API_URL}/job-applications`, testJobApplication, createAxiosConfig());
    
    const success = await checkLogs('create_application', 'job_application');
    console.log(`Create application log test ${success ? 'PASSED' : 'FAILED'}`);
    return success;
  } catch (error) {
    console.error('Error testing create application log:', error.message);
    return false;
  }
}

async function testUpdateStatusLog() {
  console.log('Testing update status log...');
  try {
    // First get an application ID
    const applications = await axios.get(`${API_URL}/job-applications`, createAxiosConfig());
    if (applications.data.length === 0) {
      console.log('No applications found to test with');
      return false;
    }
    
    const applicationId = applications.data[0].id;
    const response = await axios.put(
      `${API_URL}/job-applications/${applicationId}/status`,
      { status: 'in_review' },
      createAxiosConfig()
    );
    
    const success = await checkLogs('update_application_status', 'job_application');
    console.log(`Update status log test ${success ? 'PASSED' : 'FAILED'}`);
    return success;
  } catch (error) {
    console.error('Error testing update status log:', error.message);
    return false;
  }
}

async function testAddNoteLog() {
  console.log('Testing add note log...');
  try {
    // First get an application ID
    const applications = await axios.get(`${API_URL}/job-applications`, createAxiosConfig());
    if (applications.data.length === 0) {
      console.log('No applications found to test with');
      return false;
    }
    
    const applicationId = applications.data[0].id;
    const response = await axios.post(
      `${API_URL}/job-applications/${applicationId}/notes`,
      { content: 'Test note for logging' },
      createAxiosConfig()
    );
    
    const success = await checkLogs('add_note', 'job_application_note');
    console.log(`Add note log test ${success ? 'PASSED' : 'FAILED'}`);
    return success;
  } catch (error) {
    console.error('Error testing add note log:', error.message);
    return false;
  }
}

async function testViewLogs() {
  console.log('Testing view logs endpoint...');
  try {
    const response = await axios.get(`${API_URL}/user-logs`, createAxiosConfig());
    console.log(`Found ${response.data.total} total logs`);
    console.log('Sample log:', response.data.logs[0]);
    return true;
  } catch (error) {
    console.error('Error testing view logs:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  try {
    await setup();
    
    // Run tests
    const results = [
      await testCreateApplicationLog(),
      await testUpdateStatusLog(),
      await testAddNoteLog(),
      await testViewLogs()
    ];
    
    // Print summary
    console.log('\n--- TEST SUMMARY ---');
    console.log(`Total tests: ${results.length}`);
    console.log(`Passed: ${results.filter(r => r).length}`);
    console.log(`Failed: ${results.filter(r => !r).length}`);
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await teardown();
  }
}

// Run the tests
runTests();
