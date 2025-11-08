const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const pool = require("../db"); 
const router = express.Router();
const env = require("../../env.json");

// --- Checks if the email is already in use, creates a verification token, inserts the new user, and sends the email ---
router.post("/register", async (req, res) => {
  const { studentId, firstName, lastName, email, phone, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Insert new user into the database (verified = false)
    await pool.query(
      `INSERT INTO users (student_id, first_name, last_name, email, phone, password, verification_token, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [studentId, firstName, lastName, email, phone, password, verificationToken, false]
    );

    // Create a Nodemailer transporter using our Gmail Account
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.email,
        pass: env.email_password,
      },
    });

    // Create verification link
    const verificationLink = `${env.base_url}/auth/verify/${verificationToken}`;

    // Send verification email
    await transporter.sendMail({
      from: '"Drexel Marketplace" <drexelmarketplace@gmail.com>',
      to: email,
      subject: "Verify Your Email - Drexel Marketplace",
      html: `
        <h3>Welcome to Drexel Marketplace!</h3>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    res.status(201).json({
      message: "User registered successfully! Check your email to verify your account.",
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// --- What happens when a user clicks the verification link in their email ---
router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;

  try {
    // Check if token exists
    const user = await pool.query(
      "SELECT * FROM users WHERE verification_token = $1",
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).send("Invalid or expired verification link.");
    }

    // Mark as verified!
    await pool.query(
      "UPDATE users SET verified = $1, verification_token = NULL WHERE verification_token = $2",
      [true, token]
    );

    res.send("<h3>Email verified successfully! You can now log in.</h3>");
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).send("Server error verifying email.");
  }
});

module.exports = router;
