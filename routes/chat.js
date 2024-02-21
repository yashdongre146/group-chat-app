const express = require('express');
const chatController = require('../controllers/chat');
const userAuthentication = require('../middleware/auth');
const multer = require('../middleware/multer');

const router = express.Router();
router.use(userAuthentication.auth);
router.post('/storeChat', chatController.storeChat)
router.get('/getChats', chatController.getChats)
const upload = multer.upload;
router.post('/sendImages', upload.single('imageFile'), chatController.sendImages)

module.exports = router;