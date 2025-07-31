// Importing required modules
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { emailCredentials } = require('../config/config');

// Creating a transporter object using nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailCredentials.user,
    pass: emailCredentials.pass
  }
});

// Function to send an identification code email
const sendCodeEmail = async (email, code) => {
  const mailOptions = {
    from: emailCredentials.user,
    to: email,
    subject: 'Identification',
    text: `Your identification code is: ${code}`
  };

  try {
    // Sending the email using the transporter
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (err) {
    // Logging and throwing an error if email sending fails
    console.error("Email error:", err);
    throw new Error(`Failed to send email. ${err.message}`);
  }
};

// Function to hash a password using bcrypt
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Function to compare a password with a hashed password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Function to generate a random identification code
const generateRandomCode = () => {
  return Math.floor(Math.random() * 999999) + 1;
};

// Exporting the utility functions for use in other parts of the application
module.exports = { sendCodeEmail, hashPassword, comparePassword, generateRandomCode };
