require('dotenv').config();
const axios = require('axios');

// Test configuration
const config = {
  baseUrl: 'http://localhost:4500/api', // Update if your server runs on a different port
  testEmail: 'imadechriswebdev@gmail.com',
  zepto: {
    url: `https://${process.env.ZEPTO_HOST}`,
    token: process.env.ZEPTO_SEND_MAIL_TOKEN
  }
};

// Test data
const testData = {
  quote: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'imadechriswebdev+quote@example.com',
    phone: '+441234567890',
    address: '123 Test Street, Wellingborough, UK',
    serviceType: 'boiler',
    timeframe: '1week',
    message: 'This is a test quote request from the test suite.',
    privacyPolicyAccepted: true
  },
  contact: {
    name: 'Test User',
    email: 'imadechriswebdev+contact@example.com',
    subject: 'Test Contact Form Submission',
    message: 'This is a test message from the contact form test.',
    privacyPolicyAccepted: true
  },
  newsletter: {
    email: 'imadechriswebdev+newsletter@example.com'
  }
};

// Test runner
class ApiTester {
  constructor() {
    // Initialize API client
    this.axios = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Accept': 'application/vnd.heatflow.v1+json',
        'Content-Type': 'application/json'
      }
    });
    
    // Initialize ZeptoMail HTTP client
    this.zeptoClient = axios.create({
      baseURL: `https://${process.env.ZEPTO_HOST}/v1.1`,
      headers: {
        'Authorization': process.env.ZEPTO_SEND_MAIL_TOKEN,
        'Content-Type': 'application/json'
      }
    });
  }

  async runTests() {
    console.log('🚀 Starting API and Email Integration Tests\n');
    
    try {
      // Test 1: Direct ZeptoMail Test
      await this.testZeptoDirect();
      
      // Test 2: Quote Endpoint
      await this.testEndpoint('quotes', testData.quote);
      
      // Test 3: Contact Endpoint
      await this.testEndpoint('contact', testData.contact);
      
      // Test 4: Newsletter Subscription
      await this.testEndpoint('newsletter/subscribe', testData.newsletter, 'newsletter');
      
      console.log('\n✅ All tests completed successfully!');
    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      process.exit(1);
    }
  }

  async testZeptoDirect() {
    console.log('🔍 Testing direct ZeptoMail integration...');
    
    try {
      const response = await this.zeptoClient.post('/email', {
        from: {
          address: `noreply@${process.env.ZEPTO_SENDR_DOMAIN}`,
          name: 'HeatFlow Test'
        },
        to: [{
          email_address: {
            address: config.testEmail,
            name: 'Test Recipient'
          }
        }],
        subject: '✅ ZeptoMail Direct Test - HeatFlow Experts',
        htmlbody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Direct ZeptoMail Test Successful!</h2>
            <p>This email confirms that direct ZeptoMail integration is working correctly.</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          </div>
        `
      });
      
      console.log('  ✅ Direct ZeptoMail test passed');
      console.log('  📨 Status:', response.status);
      console.log('  📤 Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('  ❌ Direct ZeptoMail test failed:', error.message);
      throw error;
    }
  }

  async testEndpoint(endpoint, data, type = 'default') {
    console.log(`\n🔍 Testing /${endpoint} endpoint...`);
    
    try {
      // Make the API request
      const response = await this.axios.post(`/${endpoint}`, data);
      
      // Log success with relevant ID
      const idField = {
        'quotes': 'quoteId',
        'contact': 'ticketId',
        'newsletter/subscribe': 'subscriptionId'
      }[endpoint];
      
      const idValue = response.data[idField] || 'N/A';
      console.log(`  ✅ Success! (${idField}: ${idValue})`);
      
      // Verify response structure
      this.verifyResponse(response.data, type);
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response 
        ? `${error.response.status}: ${JSON.stringify(error.response.data)}`
        : error.message;
      console.error(`  ❌ Test failed: ${errorMessage}`);
      throw error;
    }
  }

  verifyResponse(data, type) {
    // Common success response check
    if (!data.success) {
      throw new Error(`Expected success: true, got ${data.success}`);
    }

    // Type-specific checks
    switch(type) {
      case 'quotes':
        if (!data.quoteId || !data.quoteId.startsWith('QUO-')) {
          throw new Error('Invalid or missing quoteId');
        }
        break;
        
      case 'contact':
        if (!data.ticketId || !data.ticketId.startsWith('TKT-')) {
          throw new Error('Invalid or missing ticketId');
        }
        break;
        
      case 'newsletter':
        if (!data.subscriptionId || !data.subscriptionId.startsWith('SUB-')) {
          throw new Error('Invalid or missing subscriptionId');
        }
        break;
    }
    
    console.log('  ✅ Response validation passed');
  }
}

// Run the tests
const tester = new ApiTester();
tester.runTests().catch(console.error);
