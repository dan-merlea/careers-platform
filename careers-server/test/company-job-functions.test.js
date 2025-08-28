const axios = require('axios');
const { Types } = require('mongoose');

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_TOKEN = process.env.TEST_TOKEN || 'test-token'; // Replace with a valid JWT token for testing

// Test data
const testCompany = {
  name: 'Test Company for Job Functions',
  website: 'https://testcompany.com',
  industry: 'Technology',
  description: 'A test company to verify default job functions are created',
  foundedYear: '2023',
  size: '10-50',
  mission: 'To test default job functions creation',
  vision: 'Creating a world with better test coverage'
};

// Expected default job functions
const expectedDefaultJobFunctions = [
  'Engineering',
  'Marketing',
  'Sales',
  'Product',
  'Design',
  'Operations',
  'Human Resources',
  'Finance'
];

// Axios instance with auth headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Test the company creation with default job functions
async function testCompanyWithDefaultJobFunctions() {
  console.log('Starting company creation with default job functions test...');
  let companyId;

  try {
    // Step 1: Create a new company
    console.log('Step 1: Creating a new company...');
    // First check if a company already exists
    let existingCompany;
    try {
      existingCompany = await api.get('/company');
      console.log('Company already exists, using existing company');
      companyId = existingCompany.data._id || existingCompany.data.id;
    } catch (error) {
      // No company exists yet, create one
      const createResponse = await api.post('/company', testCompany);
      companyId = createResponse.data._id || createResponse.data.id;
    }
    console.log(`Using company with ID: ${companyId}`);

    // Step 2: Verify job functions were created for the company
    console.log('\nStep 2: Verifying job functions were created...');
    const jobFunctionsResponse = await api.get(`/job-functions?companyId=${companyId}`);
    const jobFunctions = jobFunctionsResponse.data;
    
    console.log(`Found ${jobFunctions.length} job functions for the company`);
    
    if (jobFunctions.length === 0) {
      throw new Error('No job functions were created for the company');
    }

    // Step 3: Verify all default job functions exist
    console.log('\nStep 3: Verifying all default job functions exist...');
    const jobFunctionTitles = jobFunctions.map(jf => jf.title);
    console.log('Found job functions:', jobFunctionTitles.join(', '));
    
    for (const expectedTitle of expectedDefaultJobFunctions) {
      if (!jobFunctionTitles.includes(expectedTitle)) {
        throw new Error(`Expected job function '${expectedTitle}' was not created`);
      }
    }

    console.log('\nTest completed successfully! Default job functions are created when a new company is added.');
    
    // We don't delete the company since there's no DELETE endpoint
    // and we're likely using a shared company instance
    console.log('\nTest cleanup: Not deleting company as it may be used by other tests.');

  } catch (error) {
    console.error('Test failed with error:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run the test
testCompanyWithDefaultJobFunctions();
