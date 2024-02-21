const Groupmessage = require('../models/groupmessage')
const Group = require('../models/group');
const User = require('../models/user');
const AWS = require('aws-sdk');

function uploadToS3(data, filename){
    const BUCKET_NAME = process.env.S3_BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
  
    let s3Bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET
    })
  
    var params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: data,
      ACL: 'public-read'
    }
    return new Promise((resolve, reject)=>{
        s3Bucket.upload(params, (err, s3response)=>{
        if (err) {
          console.log("Went wrong", err);
          reject(err);
        } else {
          console.log("Success", s3response);
          resolve(s3response.Location);
        }
      })
    })
    
}

exports.storeChat =  async (req, res, io) => {
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
        const groupName = req.query.groupName;
        const users = await User.findAll();
        const group = await Group.findOne({where: {name: groupName}})
        const chats = await Groupmessage.findAll({where: {groupId: group.id}})
        res.status(201).json({chats, users})
     } catch (err) {
      console.log(err);
             res.status(400).json();
     }
}

exports.sendImages = async (req, res) => {
    try {
        const user = req.user;
        const {groupName} = req.body;
        const imageFile = req.file;
        const fileName = `chat-images/group:${groupName}/user${user.id}/${Date.now()}-${imageFile.originalname}`;
        const fileUrl = await uploadToS3(imageFile.buffer, fileName);

        const group = await Group.findOne({where: {name: groupName}})
        await user.createGroupmessage({message: fileUrl, isImage: true, groupId: group.id});
        res.status(201).json({fileUrl, isImage: true});
    } catch (err) {
        console.log(err);
        res.status(400).json();
    }
}
