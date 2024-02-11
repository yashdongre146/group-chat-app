const Groupmessage = require('../models/groupmessage')
const Group = require('../models/group');
const { login } = require('./user');


exports.storeChat =  async (req, res) => {
    try {
         const {message} = req.body;
         const groupName = req.query.groupName;
         const group = await Group.findOne({where: {name: groupName}})
         await req.user.createGroupmessage({message, groupId: group.id});
         res.status(201).json({success: true, message: "sent"})
     } catch (err) {
            console.log(err);
             res.status(400).json();
     }
 }

exports.getChats =  async (req, res) => {
    try {
        const user = req.user;
        const groupName = req.query.groupName;
        const group = await Group.findOne({where: {name: groupName}})
        const chats = await Groupmessage.findAll({where: {groupId: group.id}})
        res.status(201).json(chats)
     } catch (err) {
             res.status(400).json();
     }
 }