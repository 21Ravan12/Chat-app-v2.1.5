const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { mongoUri, dbName1 } = require('./config/config'); // Import from your config file

const app = express();

// MongoDB connection
let db;

MongoClient.connect(mongoUri)
  .then(client => {
    db = client.db(dbName1);
    console.log(`Connected to MongoDB: ${dbName1}`);
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    setTimeout(() => {
      console.log('Retrying MongoDB connection...');
      MongoClient.connect(mongoUri, { useUnifiedTopology: true }).catch(console.error);
    }, 5000); // Retry after 5 seconds
  });

// CORS settings
app.use(cors({
  origin: '*', // Or restrict to specific origins for production
  methods: ["GET", "POST"],
  credentials: true
}));

// Server setup
const server = app.listen(3002, '0.0.0.0', () => {
  console.log('Server is running on http://192.168.0.158:3002');
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*', // Or restrict to specific origins for production
    methods: ["GET", "POST"],
    credentials: true
  }
});

let users = {}; // Online users

// Save message to MongoDB
const saveMessageToDB = async (messageData) => {
  try {
    await db.collection('messages').insertOne(messageData);
    console.log('Message saved to DB:', messageData);
  } catch (err) {
    console.error("Error saving message:", err);
  }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected with socket ID:', socket.id);

  // User joins the chat
  socket.on('join', async (username) => {
    if (!username) return socket.disconnect(true);  // Disconnect if no username
  
    socket.username = username;  // Set the username for this socket
    users[socket.id] = username;  // Store the username by socket ID
  
    try {
      // Retrieve unread messages for the user
      const unreadMessages = await db.collection('messages').find({
        to: username,
        isRead: false
      }).toArray();
  
      // Emit the number of unread messages
      socket.emit('unread messages', unreadMessages.length);
  
      // Log the number of unread messages
      console.log(`${username} has ${unreadMessages.length} unread messages.`);
    } catch (err) {
      console.error('Error fetching unread messages:', err);
    }
  });
  socket.on('read message', async (messageId) => {
    try {
      // Update the message to mark it as read in the database
      await db.collection('messages').updateOne(
        { _id: new MongoClient.ObjectID(messageId) },  // Convert messageId to ObjectId
        { $set: { isRead: true } }  // Set 'isRead' field to true
      );
  
      // Log the successful update with the correct template literal
      console.log(`Message ${messageId} marked as read.`);
    } catch (err) {
      console.error("Error updating message status:", err);
    }
  });
  

  // Send private message
  socket.on('private message', async (data, callback) => {
    const { toUsername, message } = data;
    const fromUsername = socket.username; // Sender's username

    if (!toUsername || !message || !fromUsername) {
      return callback({ status: 'error', message: 'Invalid data.' });
    }

    // Check if recipient is online
    const recipientSocketId = Object.keys(users).find(id => users[id] === toUsername);
    const messageData = {
      from: fromUsername,
      to: toUsername,
      message,
      isRead: false,
      timestamp: new Date().toISOString()
    };

    if (recipientSocketId && io.sockets.sockets.get(recipientSocketId)) {
      // Send the message to the specific recipient
      io.to(recipientSocketId).emit('chat message', messageData);
      console.log(`Message sent to ${toUsername}`);
      callback({ status: 'success', message: 'Message delivered.' });
      await saveMessageToDB(messageData);
    } else {
      // Save message to DB if recipient is offline
      await saveMessageToDB(messageData);
      console.log(`Message saved for offline user: ${toUsername}`);
      callback({ status: 'success', message: 'Recipient offline. Message saved to database.' });
    }
  });

  // User disconnects from the chat
  socket.on('disconnect', () => {
    if (socket.username) {
      delete users[socket.id]; // Remove user from online list
      io.emit('update users', Object.values(users)); // Broadcast updated user list
      console.log(`${socket.username} has left the chat.`);
    }
  });
});

