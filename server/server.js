// Importing required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Importing controllers for user, friend, and chat functionalities
const { registerUser, completeRegistration, requestPasswordReset, verifyRecoveryCode, loginUser, getProfile, updateProfile, refreshPassword } = require('./controllers/userController');
const { addFriend, getFriends } = require('./controllers/friendController');
const { getChatMessages, getUnreadMessagesCount, readMyMessages } = require('./controllers/chatController');

// Initializing the Express application
const app = express();

// Enabling CORS for cross-origin requests
app.use(cors());

// Configuring body-parser middleware to handle JSON and URL-encoded data
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Defining routes for user-related operations
app.post('/api/signup/enter', registerUser);
app.post('/api/signup/end', completeRegistration);
app.post('/api/login', loginUser);
app.post('/api/login/forget/enter', requestPasswordReset);
app.post('/api/login/forget/end', verifyRecoveryCode);
app.post('/api/login/password/resfresh', refreshPassword);
app.get('/api/profile/get', getProfile);
app.put('/api/profile/update', updateProfile);

// Defining routes for friend-related operations
app.put('/api/friend/add', addFriend);
app.get('/api/friend/get', getFriends);

// Defining routes for chat-related operations
app.get('/api/chat/get', getChatMessages);
app.get('/api/chat/unreadCount/get', getUnreadMessagesCount);
app.post('/api/chat/markAsRead', readMyMessages);

// Setting the port for the server to listen on
const PORT = process.env.PORT || 3000;

// Starting the server and logging the port it's running on
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
