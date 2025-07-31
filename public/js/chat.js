// Initialize Socket.io connection
const socket = io(''); // Server address

// User and recipient information
let username;
let recipient;

// Join chat after entering username
function joinChat() {
  if (username) {
    socket.emit('join', username);
  } else {
    console.log("Username is missing. Please log in first.");
  }
}

// Send private message
function sendPrivateMessage() {
  recipient = sessionStorage.getItem('recipient');
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value;
  if (recipient && message) {
    socket.emit('private message', { toUsername: recipient, message }, (response) => {
      console.log(response.message); // Message status
    });

    // Add sent message to the screen
    appendMessage(recipient, { from: username, message }, true); // Sender
    messageInput.value = ''; // Clear message input
  }
}

// Display incoming messages
socket.on('chat message', (messageData) => {
  appendMessage(messageData.from, messageData, false); // Incoming message
});

// Add messages to the screen
function appendMessage(chatUser, messageData, isMyMessage) {
  const chatBox = document.getElementById(`chatbox-${chatUser}`);
  
  if (!chatBox) {
    console.error(`Chatbox not found: chatbox-${chatUser}`);
    return;
  }

  const updatedMessageData = { ...messageData, isRead: true };

  const messageElement = document.createElement('div');
  messageElement.classList.add(isMyMessage ? 'my-message' : 'other-message');

  const strongElement = document.createElement('strong');
  strongElement.className = isMyMessage ? 'my-message-name' : 'other-message-name';
  strongElement.textContent = `${updatedMessageData.from}:`;

  const messageText = document.createElement('p');
  messageText.appendChild(strongElement);
  messageText.appendChild(document.createTextNode(` ${updatedMessageData.message}`));

  messageElement.appendChild(messageText);
  chatBox.appendChild(messageElement);
  
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the latest message
}
