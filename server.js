const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.email,
    pass: process.env.emailPassword,
  },
});

const logoPath = path.join(__dirname, "assets", "logo.png");

// Contact Form Route
app.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  const contactEmailTemplate = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
        <img src="cid:logo" alt="HeatFlow Experts Logo" style="max-width: 150px; margin-bottom: 20px;">
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
    const info = await transporter.sendMail({
      from: process.env.email,
      to: email,
      subject: "New Contact Form Submission",
      html: thanksMessage,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo",
        },
      ],
    });

    const report = await transporter.sendMail({
      from: process.env.email,
      to: "info@heatflowexperts.co.uk",
      subject: "New Contact Form Submission",
      html: contactEmailTemplate,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo",
        },
      ],
    });

    console.log("Contact email sent:", info.messageId);
    console.log("Contact email sent:", report.messageId);
    res
      .status(200)
      .send({ message: "Contact form submitted successfully", status: 200 });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).send({
      message: "Error submitting contact form",
      status: 500,
      error: error.message,
    });
  }
});

// Subscribe Form Route
app.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  const subscribeEmailTemplate = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
        <img src="cid:logo" alt="HeatFlow Experts Logo" style="max-width: 150px; margin-bottom: 20px;">
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
        <img src="cid:logo" alt="HeatFlow Experts Logo" style="max-width: 150px; margin-bottom: 20px;">
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
    const info = await transporter.sendMail({
      from: process.env.email,
      to: process.env.email,
      subject: "New Subscription",
      html: subscribeEmailTemplate,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo",
        },
      ],
    });

    const report = await transporter.sendMail({
      from: process.env.email,
      to: "info@heatflowexperts.co.uk",
      subject: "New Subscription",
      html: subscribeEmailReport,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo",
        },
      ],
    });

    console.log("Subscription email sent:", info.messageId);
    console.log("Subscription email sent:", report.messageId);
    res.status(200).send({ message: "Subscription successful", status: 200 });
  } catch (error) {
    console.error("Error sending subscription email:", error);
    res.status(500).send({
      message: "Error submitting subscription",
      status: 500,
      error: error.message,
    });
  }
});

// Root Route
app.get("/", (req, res) => {
  res.send("App works fine ☺️");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

// Start Server
const PORT = process.env.PORT || 4500;
app.listen(PORT, () => {
  console.log(`Server Running on PORT ${PORT}`);
});
