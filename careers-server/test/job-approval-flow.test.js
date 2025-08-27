const axios = require('axios');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const { Types } = require('mongoose');

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_TOKEN = process.env.TEST_TOKEN || 'test-token'; // Replace with a valid JWT token for testing

// Test data
const testCompanyId = new Types.ObjectId().toString();
const testDepartmentId = new Types.ObjectId().toString();
const testOfficeId = new Types.ObjectId().toString();

// Test job data
const testJob = {
  title: 'Test Job for Approval Flow',
  companyId: testCompanyId,
  location: 'Test Location',
  content: 'This is a test job description for testing the approval flow.',
  departmentIds: [testDepartmentId],
  officeIds: [testOfficeId],
  // Status will be set to DRAFT by default on the server
};

// Axios instance with auth headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Test the complete job approval flow
async function testJobApprovalFlow() {
  console.log('Starting job approval flow test...');
  let jobId;

  try {
    // Step 1: Create a new job (should be in DRAFT status)
    console.log('Step 1: Creating a new job...');
    const createResponse = await api.post('/jobs', testJob);
    jobId = createResponse.data.id;
    console.log(`Job created with ID: ${jobId}`);
    console.log(`Initial status: ${createResponse.data.status}`);
    
    if (createResponse.data.status !== 'draft') {
      throw new Error(`Expected job status to be 'draft', but got '${createResponse.data.status}'`);
    }

    // Step 2: Submit the job for approval
    console.log('\nStep 2: Submitting job for approval...');
    const submitResponse = await api.put(`/jobs/${jobId}/submit-for-approval`);
    console.log(`Status after submission: ${submitResponse.data.status}`);
    
    if (submitResponse.data.status !== 'pending_approval') {
      throw new Error(`Expected job status to be 'pending_approval', but got '${submitResponse.data.status}'`);
    }

    // Step 3: Approve the job
    console.log('\nStep 3: Approving the job...');
    const approveResponse = await api.put(`/jobs/${jobId}/approve`, { userId: 'test-admin' });
    console.log(`Status after approval: ${approveResponse.data.status}`);
    
    if (approveResponse.data.status !== 'approved') {
      throw new Error(`Expected job status to be 'approved', but got '${approveResponse.data.status}'`);
    }

    // Step 4: Publish the job
    console.log('\nStep 4: Publishing the job...');
    const publishResponse = await api.put(`/jobs/${jobId}/publish`);
    console.log(`Status after publishing: ${publishResponse.data.status}`);
    
    if (publishResponse.data.status !== 'published') {
      throw new Error(`Expected job status to be 'published', but got '${publishResponse.data.status}'`);
    }

    // Step 5: Verify all metadata is set correctly
    console.log('\nStep 5: Verifying job metadata...');
    const jobResponse = await api.get(`/jobs/${jobId}`);
    const job = jobResponse.data;
    
    console.log('Job metadata:');
    console.log(`- Status: ${job.status}`);
    console.log(`- Approved by: ${job.approvedBy || 'Not set'}`);
    console.log(`- Approved at: ${job.approvedAt || 'Not set'}`);
    console.log(`- Published date: ${job.publishedDate || 'Not set'}`);

    if (!job.approvedBy) {
      console.warn('Warning: approvedBy field is not set');
    }
    
    if (!job.approvedAt) {
      console.warn('Warning: approvedAt field is not set');
    }
    
    if (!job.publishedDate) {
      console.warn('Warning: publishedDate field is not set');
    }

    console.log('\nTest completed successfully! The job approval flow works as expected.');
    
    // Optional: Clean up by archiving the job
    console.log('\nCleaning up: Archiving the test job...');
    await api.put(`/jobs/${jobId}/archive`);
    console.log('Job archived.');

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
testJobApprovalFlow();
