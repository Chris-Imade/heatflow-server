const express = require("express");
const { SendMailClient } = require("zeptomail");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

dotenv.config();

const app = express();

// Configure rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "RateLimitExceeded",
    message: "Too many requests, please try again later",
    retryAfter: 3600
  }
});

// Middleware
app.use(cors({ 
  origin: ["https://heatflowexperts.co.uk", "http://127.0.0.1:5500"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));

// API versioning middleware
app.use((req, res, next) => {
  const acceptHeader = req.headers['accept'] || '';
  if (acceptHeader.includes('application/vnd.heatflow.v1+json')) {
    req.apiVersion = 'v1';
  } else {
    req.apiVersion = 'v1'; // Default to v1
  }
  next();
});

// Configure ZeptoMail HTTP Client
const axios = require('axios');
const zeptoClient = axios.create({
  baseURL: `https://${process.env.ZEPTO_HOST}/v1.1`,
  headers: {
    'Authorization': process.env.ZEPTO_SEND_MAIL_TOKEN,
    'Content-Type': 'application/json'
  }
});

// Helper function to send email
const sendEmail = async (to, subject, html) => {
  try {
    const response = await zeptoClient.post('/email', {
      from: {
        address: `noreply@${process.env.ZEPTO_SENDR_DOMAIN}`,
        name: "HeatFlow Experts"
      },
      to: [{
        email_address: {
          address: to
        }
      }],
      subject: subject,
      htmlbody: html
    });
    
    return response.data;
  } catch (error) {
    console.error('ZeptoMail Error:', error.response?.data || error.message);
    throw new Error('Failed to send email');
  }
};

// Contact Form Route
app.post("/api/contact", 
  apiLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('privacyPolicyAccepted').isBoolean().withMessage('Privacy policy must be accepted')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "One or more validation errors occurred",
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }

    const { name, email, subject, message, privacyPolicyAccepted } = req.body;
    
    if (!privacyPolicyAccepted) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Privacy policy must be accepted",
        errors: [{
          field: "privacyPolicyAccepted",
          message: "Privacy policy must be accepted"
        }]
      });
    }

  const contactEmailTemplate = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
        <img src="https://heatflowexperts.co.uk/img/logo.png" alt="HeatFlow Experts Logo" style="max-width: 150px; margin-bottom: 20px;">
      </div>
      <div style="padding: 20px;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      </div>
      <div style="background-color: #3855b3; padding: 20px; text-align: center; color: white;">
        <p>&copy; 2025 HeatFlow Experts. All rights reserved.</p>
      </div>
    </div>
  `;

  const thanksMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You Email</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #3855b3;
          padding: 20px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .body {
          padding: 20px;
          line-height: 1.6;
        }
        .footer {
          background-color: #f4f4f4;
          text-align: center;
          padding: 10px;
          font-size: 14px;
          color: #666;
        }
        .footer a {
          color: #3855b3;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <h1>Thank You!</h1>
        </div>

        <!-- Body -->
        <div class="body">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for reaching out to us at <strong>HeatFlow Experts</strong>. We have received your message and our team is currently reviewing your request. We will get back to you as soon as possible.</p>
          <p>If you have any urgent inquiries, feel free to contact us directly at <strong>+234 903 316 2469, +1 (575) 205-6122</strong> or reply to this email.</p>
          <p>We appreciate your patience and look forward to assisting you!</p>
          <p>Best regards,</p>
          <p><strong>The HeatFlow Experts Team</strong></p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>&copy; 2025 HeatFlow Experts. All rights reserved.</p>
          <p>
            <a href="https://instructo.africa">Visit our website</a> |
            <a href="mailto:info@instructo.africa">Email us</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

    try {
      const ticketId = 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Send confirmation to user
      await sendEmail(email, "Thank You for Contacting HeatFlow Experts", thanksMessage);
      
      // Send notification to admin
      await sendEmail(
        process.env.ADMIN_EMAIL || "developer@heatflowexperts.co.uk",
        `New Contact Form Submission: ${subject}`,
        contactEmailTemplate
      );
      
      res.status(200).json({
        success: true,
        message: "Your message has been sent successfully. We'll get back to you soon.",
        ticketId
      });
      
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(500).json({
        success: false,
        error: "InternalServerError",
        message: "An unexpected error occurred. Please try again later.",
        requestId: `req_${Date.now()}`
      });
    }
});

// Newsletter Subscription Route
app.post("/api/newsletter/subscribe", 
  apiLimiter,
  [
    body('email').isEmail().withMessage('Must be a valid email address')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Invalid email address",
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }

    const { email } = req.body;
    const subscriptionId = 'SUB-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // In a real app, you would check if email is already subscribed in your database
    const isAlreadySubscribed = false; // Replace with actual check

  const subscribeEmailTemplate = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
        <img src="https://heatflowexperts.co.uk/img/logo.png" alt="HeatFlow Experts Logo" style="max-width: 150px; margin-bottom: 20px;">
      </div>
      <div style="padding: 20px;">
        <p>Thank you for subscribing to HeatFlow Experts!</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>
      <div style="background-color: #3855b3; padding: 20px; text-align: center; color: white;">
        <p>&copy; 2025 HeatFlow Experts. All rights reserved.</p>
      </div>
    </div>
  `;

  const subscribeEmailReport = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
        <img src="https://heatflowexperts.co.uk/img/logo.png" alt="HeatFlow Experts Logo" style="max-width: 150px; margin-bottom: 20px;">
      </div>
      <div style="padding: 20px;">
        <p>You have a new subscriber from HeatFlow Experts!</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>
      <div style="background-color: #3855b3; padding: 20px; text-align: center; color: white;">
        <p>&copy; 2025 HeatFlow Experts. All rights reserved.</p>
      </div>
    </div>
  `;

    try {
      // Send confirmation to subscriber
      await sendEmail(email, "Welcome to HeatFlow Experts Newsletter", subscribeEmailTemplate);
      
      // Send notification to admin
      await sendEmail(
        process.env.ADMIN_EMAIL || "developer@heatflowexperts.co.uk",
        "New Newsletter Subscription",
        subscribeEmailReport
      );
      
      const response = {
        success: true,
        message: isAlreadySubscribed 
          ? "This email is already subscribed to our newsletter" 
          : "Successfully subscribed to our newsletter",
        subscriptionId
      };
      
      res.status(200).json(response);
      
    } catch (error) {
      console.error("Error processing subscription:", error);
      res.status(500).json({
        success: false,
        error: "InternalServerError",
        message: "An unexpected error occurred. Please try again later.",
        requestId: `req_${Date.now()}`
      });
    }
});

// Quote Form Route
app.post("/api/quotes",
  apiLimiter,
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('serviceType').isIn(['boiler', 'heat-pump', 'ac', 'smart', 'plumbing', 'other'])
      .withMessage('Invalid service type'),
    body('timeframe').isIn(['urgent', '1week', '2weeks', '1month', 'flexible'])
      .withMessage('Invalid timeframe'),
    body('privacyPolicyAccepted').isBoolean().withMessage('Privacy policy must be accepted')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "One or more validation errors occurred",
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      serviceType,
      timeframe,
      message = '',
      privacyPolicyAccepted
    } = req.body;

    if (!privacyPolicyAccepted) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Privacy policy must be accepted",
        errors: [{
          field: "privacyPolicyAccepted",
          message: "Privacy policy must be accepted"
        }]
      });
    }

    const quoteId = 'QUO-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    try {
      // Email to customer
      const customerEmailTemplate = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
            <img src="cid:logo" alt="HeatFlow Experts Logo" style="max-width: 150px; margin-bottom: 20px;">
          </div>
          <div style="padding: 20px;">
            <h2>Thank you for your quote request, ${firstName}!</h2>
            <p>We've received your request and our team is reviewing it. Here are the details you provided:</p>
            
            <h3>Quote Request #${quoteId}</h3>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Service Type:</strong> ${serviceType}</p>
            <p><strong>Timeframe:</strong> ${timeframe}</p>
            <p><strong>Address:</strong> ${address}</p>
            ${message ? `<p><strong>Your Message:</strong> ${message}</p>` : ''}
            
            <p>We'll get back to you within 24 hours with a detailed quote.</p>
            <p>If you have any questions, feel free to reply to this email or call us at +1 (575) 205-6122.</p>
          </div>
          <div style="background-color: #3855b3; padding: 20px; text-align: center; color: white;">
            <p>&copy; 2025 HeatFlow Experts. All rights reserved.</p>
          </div>
        </div>
      `;

      // Email to admin
      const adminEmailTemplate = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
            <img src="https://heatflowexperts.co.uk/img/logo.png" alt="HeatFlow Experts Logo" style="max-width: 150px; margin-bottom: 20px;">
          </div>
          <div style="padding: 20px;">
            <h2>New Quote Request #${quoteId}</h2>
            
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Address:</strong> ${address}</p>
            
            <h3>Service Details</h3>
            <p><strong>Service Type:</strong> ${serviceType}</p>
            <p><strong>Timeframe:</strong> ${timeframe}</p>
            ${message ? `<p><strong>Customer Message:</strong> ${message}</p>` : ''}
            
            <p>Please respond to this quote request within 24 hours.</p>
          </div>
          <div style="background-color: #3855b3; padding: 20px; text-align: center; color: white;">
            <p>&copy; 2025 HeatFlow Experts. All rights reserved.</p>
          </div>
        </div>
      `;

      // Send confirmation to customer
      await sendEmail(email, `Your Quote Request #${quoteId}`, customerEmailTemplate);
      
      // Send notification to admin
      await sendEmail(
        process.env.ADMIN_EMAIL || "developer@heatflowexperts.co.uk",
        `New Quote Request: ${firstName} ${lastName} - ${serviceType}`,
        adminEmailTemplate
      );
      
      res.status(200).json({
        success: true,
        message: "Quote request received successfully",
        quoteId,
        estimatedResponseTime: "24 hours"
      });
      
    } catch (error) {
      console.error("Error processing quote request:", error);
      res.status(500).json({
        success: false,
        error: "InternalServerError",
        message: "An unexpected error occurred. Please try again later.",
        requestId: `req_${Date.now()}`
      });
    }
  }
);

// Root Route
app.get("/", (req, res) => {
  res.json({
    app: "HeatFlow Experts API",
    version: "1.0.0",
    status: "running",
    documentation: "https://heatflowexperts.co.uk/api-docs"
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "NotFound",
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  
  // Handle rate limit exceeded errors
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      error: "RateLimitExceeded",
      message: "Too many requests, please try again later",
      retryAfter: 3600
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError' || err.name === 'ValidatorError') {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "One or more validation errors occurred",
      errors: Object.values(err.errors || {}).map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
  
  // Default error response
  const status = err.status || 500;
  const response = {
    success: false,
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred. Please try again later.",
    requestId: `req_${Date.now()}`
  };
  
  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  
  res.status(status).json(response);
});

// Start Server
const PORT = process.env.PORT || 4500;
app.listen(PORT, () => {
  console.log(`Server Running on PORT ${PORT}`);
});
