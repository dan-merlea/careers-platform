// Test script for job board API endpoint
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000'; // Update with your actual API URL
const JOB_BOARD_ID = '65f0c1234567890123456789'; // Replace with a valid job board ID

async function testJobBoardEndpoint() {
  try {
    console.log(`Testing GET /jobs/job-board/${JOB_BOARD_ID} endpoint...`);
    
    const response = await axios.get(`${API_URL}/jobs/job-board/${JOB_BOARD_ID}`);
    
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log(`✅ Success! Endpoint returned ${response.data.length} jobs for job board ID: ${JOB_BOARD_ID}`);
      
      // Check if job_board_id is included in the response
      if (response.data.length > 0) {
        const firstJob = response.data[0];
        console.log('First job job_board_id:', firstJob.job_board_id);
        
        if (firstJob.job_board_id === JOB_BOARD_ID) {
          console.log('✅ job_board_id is correctly included in the response');
        } else {
          console.log('⚠️ job_board_id is present but doesn\'t match the requested ID');
        }
      }
    } else {
      console.log('❌ Unexpected status code');
    }
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testJobBoardEndpoint();
