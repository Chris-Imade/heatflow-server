require('dotenv').config();
const axios = require('axios');

// Test email configuration
const testConfig = {
  to: 'imadechriswebdev@gmail.com',
  from: `noreply@${process.env.ZEPTO_SENDR_DOMAIN}`,
  subject: '🔥 HeatFlow Experts - Test Email',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #2c3e50; margin-bottom: 20px;">Test Email from HeatFlow Experts</h1>
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
          This is a test email sent via ZeptoMail to verify the integration.
        </p>
      </div>
      <div style="background-color: #f1f3f5; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; margin-top: 2px;">
        <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
          If you received this email, the ZeptoMail integration is working correctly! 🎉
        </p>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #95a5a6; font-size: 12px;">
        <p>© ${new Date().getFullYear()} HeatFlow Experts. All rights reserved.</p>
      </div>
    </div>
  `
};

// Initialize ZeptoMail HTTP client
const zeptoClient = axios.create({
  baseURL: `https://${process.env.ZEPTO_HOST}/v1.1`,
  headers: {
    'Authorization': process.env.ZEPTO_SEND_MAIL_TOKEN,
    'Content-Type': 'application/json'
  }
});

// Test function to send email
async function sendTestEmail() {
  console.log('🚀 Starting email test...');
  console.log(`📧 Sending test email to: ${testConfig.to}`);
  
  try {
    const response = await zeptoClient.post('/email', {
      from: {
        address: testConfig.from,
        name: 'HeatFlow Test'
      },
      to: [{
        email_address: {
          address: testConfig.to,
          name: 'Test Recipient'
        }
      }],
      subject: testConfig.subject,
      htmlbody: testConfig.html
    });

    console.log('✅ Email sent successfully!');
    console.log('📨 Status:', response.status);
    console.log('📤 Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending email:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Run the test
sendTestEmail()
  .then(() => {
    console.log('✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed!');
    process.exit(1);
  });
