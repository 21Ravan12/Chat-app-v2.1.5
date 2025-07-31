// Importing required modules
const { MongoClient } = require('mongodb');
const { mongoUri, dbName1 } = require('../config/config');

// Creating a new MongoClient instance
const client = new MongoClient(mongoUri);
let db1;

// Connecting to MongoDB
client.connect()
  .then(() => {
    // Assigning the connected database to db1
    db1 = client.db(dbName1);
    console.log("Connected to MongoDB for chat");
  })
  .catch(err => console.error("MongoDB connection failed:", err));

// Function to get chat messages between two users
const getChatMessages = async (req, res) => {
  const { sender, receiver } = req.query; // Using req.query instead of req.body

  if (!sender || !receiver) {
    return res.status(400).json({ message: "Sender and receiver are required." });
  }

  try {
    // Fetching messages from the database
    const messages = await db1.collection('messages').find({
      $or: [{ from: sender, to: receiver }, { from: receiver, to: sender }]
    }).toArray();

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Server error occurred." });
  }
};

// Function to get the count of unread messages
const getUnreadMessagesCount = async (req, res) => {
  const { sender, receiver } = req.query; // Using req.query correctly

  if (!sender || !receiver) {
    return res.status(400).json({ message: "Sender and receiver are required." });
  }

  try {
    // Counting unread messages in the database
    const unreadCount = await db1.collection('messages').countDocuments({
      from: sender, 
      to: receiver, 
      isRead: false // Filtering only unread messages
    });

    return res.status(200).json({ unreadMessages: unreadCount });
  } catch (error) {
    console.error("Error fetching unread messages count:", error);
    return res.status(500).json({ message: "Server error occurred." });
  }
};

// Function to mark messages as read
const readMyMessages = async (req, res) => {
  const { sender, receiver } = req.body; // Using req.body instead of req.query

  if (!sender || !receiver) {
    return res.status(400).json({ message: "Sender and receiver are required." });
  }

  try {
    // Updating unread messages to mark them as read
    const updateResult = await db1.collection('messages').updateMany(
      { from: sender, to: receiver, isRead: false }, // Only unread messages
      { $set: { isRead: true } } // Updating the isRead field
    );

    return res.status(200).json({ message: "Messages marked as read", modifiedCount: updateResult.modifiedCount });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res.status(500).json({ message: "Server error occurred." });
  }
};

// Exporting the controller functions
module.exports = { getChatMessages, getUnreadMessagesCount, readMyMessages };
