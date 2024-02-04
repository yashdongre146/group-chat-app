const Chat = require("../models/chat")

exports.storeChat =  (req, res) => {
    try {
         req.user.createChat(req.body);
         res.status(201).json({success: true, message: "sent"})
     } catch (err) {
             res.status(400).json();
     }
 }

exports.getChats =  async (req, res) => {
    try {
         const chats = await Chat.findAll();
         res.status(201).json(chats)
     } catch (err) {
             res.status(400).json();
     }
 }