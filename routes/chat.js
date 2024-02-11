const express = require('express');
const chatController = require('../controllers/chat');
const userAuthentication = require('../middleware/auth');

const router = express.Router();

router.post('/storeChat',userAuthentication.auth, chatController.storeChat)
router.get('/getChats',userAuthentication.auth, chatController.getChats)

module.exports = router;