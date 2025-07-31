// Load environment variables from .env file
require('dotenv').config();

module.exports = {
    // MongoDB connection URI
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    
    // Name of the primary database
    dbName: process.env.DB_NAME || 'My_social_web_database',
    
    // Name of the secondary database
    dbName1: process.env.DB_NAME1 || 'chatApp',
    
    // Email credentials for nodemailer
    emailCredentials: {
      // Email address used for sending emails
      user: process.env.EMAIL_USER || '',
      
      // Password for the email account
      pass: process.env.EMAIL_PASS || ''
    }
};