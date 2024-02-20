const express = require('express');
const chatController = require('../controllers/chat');
const userAuthentication = require('../middleware/auth');
const socketIO = require('socket.io');
const http = require('http')

const router = express.Router();
// Create an HTTP server
const server = http.createServer(router);

// Pass the HTTP server to Socket.IO
const io = socketIO(7000, {
    cors: {
        origin: ['http://localhost:3000']
    }
});

// Initialize Socket.IO and pass the io instance to the controller
chatController.handleSocket(io);
router.post('/storeChat',userAuthentication.auth, chatController.storeChat)
router.get('/getChats',userAuthentication.auth, chatController.getChats)

module.exports = router;