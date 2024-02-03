const express = require('express');
const chatController = require('../controllers/chat');
const userAuthentication = require('../middleware/auth');

const router = express.Router();
router.use(userAuthentication.auth);

router.post('/storeChat', chatController.storeChat)
router.get('/getChats', chatController.getChats)

module.exports = router;