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

  try {
    const info = await transporter.sendMail({
      from: process.env.email,
      to: email,
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
    res
      .status(200)
      .send({ message: "Contact form submitted successfully", status: 200 });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res
      .status(500)
      .send({
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

    console.log("Subscription email sent:", info.messageId);
    res.status(200).send({ message: "Subscription successful", status: 200 });
  } catch (error) {
    console.error("Error sending subscription email:", error);
    res
      .status(500)
      .send({
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
