// Importing required modules
const { MongoClient } = require('mongodb');
const { sendCodeEmail, hashPassword, comparePassword, generateRandomCode } = require('../utils/utils');
const { mongoUri, dbName } = require('../config/config');

// Creating a new MongoClient instance
const client = new MongoClient(mongoUri);
let db;

// Connecting to MongoDB
client.connect()
  .then(() => {
    // Assigning the connected database to db
    db = client.db(dbName);
    console.log("Connected to MongoDB");
  })
  .catch(err => console.error("MongoDB connection failed:", err));

// In-memory storage for sign-in and password reset processes
const signinStorage = new Map();
const forgetStorage = new Map();

// Function to register a new user
const registerUser = async (req, res) => {
  try {
    const { email, password, name, bio, birthyear } = req.body;
    const existingUser = await db.collection('users').findOne({ email });
    const existingName = await db.collection('users').findOne({ name });
    
    if (existingUser || existingName) {
      return res.status(409).json({ message: `This email or name is already in use: ${email}` });
    }

    const hashedPassword = await hashPassword(password);
    const randomCode = generateRandomCode();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    // Storing user data temporarily for verification
    signinStorage.set(email, { email, password: hashedPassword, name, bio, birthyear, code: randomCode, expiresAt });

    await sendCodeEmail(email, randomCode);
    res.status(200).json({ message: "Verification code sent successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Function to complete user registration after verification
const completeRegistration = async (req, res) => {
  try {
    const { code } = req.body;
    const userEntry = Array.from(signinStorage.entries()).find(
      ([_, value]) => String(value.code) === String(code)
    );

    if (!userEntry) {
      return res.status(400).json({ message: "Invalid code entered." });
    }

    const [email, userStorage] = userEntry;

    if (Date.now() > userStorage.expiresAt) {
      signinStorage.delete(email);
      return res.status(400).json({ message: "The verification code has expired." });
    }

    const newUser = {
      name: userStorage.name,
      email: userStorage.email,
      password: userStorage.password,
      bio: userStorage.bio,
      birthyear: userStorage.birthyear,
    };

    await db.collection('users').insertOne(newUser);
    signinStorage.delete(email);
    res.status(200).json({ message: "User successfully signed up!" });
  } catch (err) {
    res.status(500).json({ message: `Error occurred: ${err.message}` });
  }
};

// Function to request a password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await db.collection('users').findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "No user found with this email." });
    }

    const randomCode = generateRandomCode();
    const expiresAt = Date.now() + 15 * 60 * 1000;
    forgetStorage.set(email, { email, code: randomCode, expiresAt });
    
    await sendCodeEmail(email, randomCode);
    res.status(200).json({ message: "Password recovery code sent successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Function to verify the recovery code for password reset
const verifyRecoveryCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userEntry = Array.from(forgetStorage.entries()).find(
      ([_, value]) => value.code === Number(code)
    );

    if (!userEntry) {
      return res.status(400).json({ message: "Invalid recovery code entered." });
    }

    const [email, userStorage] = userEntry;

    if (Date.now() > userStorage.expiresAt) {
      return res.status(400).json({ message: "The recovery code has expired." });
    }

    res.status(200).json({ message: "Code successfully verified!", email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Function to log in a user
const loginUser = async (req, res) => {
  try {
    console.log("Login request received:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await db.collection("users").findOne({ email });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await comparePassword(password, user.password);
    console.log("Password match:", isMatch);

    if (isMatch) {
      res.status(200).json({ message: "Login successful!" });
    } else {
      res.status(400).json({ message: "Invalid password." });
    }
  } catch (err) {
    console.error("Error in loginUser:", err);
    res.status(500).json({ message: "Internal server error.", error: err.message });
  }
};

// Function to refresh a user's password
const refreshPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email, current password, and new password are required." });
    }

    // Finding the user in the database
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hashing the new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Updating the password in the database
    const result = await db.collection('users').updateOne(
      { email },
      { $set: { password: hashedNewPassword } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Password updated successfully!" });
    } else {
      res.status(500).json({ message: "Failed to update password." });
    }
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Server error occurred." });
  }
};

// Function to get a user's profile
const getProfile = async (req, res) => {
  try {
    // Using req.query to get email for GET request
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const currentYear = new Date().getFullYear();
    const age = user.birthyear ? currentYear - user.birthyear : null;

    res.status(200).json({
      profileImage: user.profileImage || '',
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      age,
    });

  } catch (err) {
    console.error("Error in getProfile:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Function to update a user's profile
const updateProfile = async (req, res) => {
  try {
    const { email, name, bio, age, profileImage } = req.body;
    const birthyear = new Date().getFullYear() - age;

    // Updating the user's profile in the database
    const result = await db.collection('users').updateOne(
      { email },
      { $set: { name, bio, birthyear, profileImage } }
    );

    if (result.matchedCount > 0) {
      res.status(200).json({ message: "Profile updated successfully!" });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Exporting the controller functions
module.exports = { registerUser, completeRegistration, requestPasswordReset, verifyRecoveryCode, loginUser, getProfile, updateProfile, refreshPassword };
