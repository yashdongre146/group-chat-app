const User = require('../models/user')
const Group = require('../models/group')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken');
const ForgotPassword = require('../models/forgotPassword');
const { v4: uuidv4, v5: uuidv5 } = require('uuid')


const Sib = require('sib-api-v3-sdk');

function generateToken(id, name){
    return jwt.sign({id, name}, process.env.JWT_SECRET)
}

exports.signup =  (req, res) => {
   try {
        const {name, email, number, password} = req.body;
        bcryptjs.hash(password, 10, async (err, hash)=>{
            const user = await User.create({name, email, number, password: hash});
            res.json(user);
        })
    } catch (err) {
            res.status(400).json();
    }
}
exports.login = async (req, res) => {
    try {
        const user = await User.findOne({where: {email : req.body.email}})
        if (user) {
            bcryptjs.compare(req.body.password, user.password, async (err, resp)=>{
                const passwordMatch = await bcryptjs.compare(req.body.password, user.password);

                if (passwordMatch) {
                    res.json({ token: generateToken(user.id, user.name) });
                } else {
                    res.status(422).json({ message: 'Password does not match.' });
                }
            })
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong.' });
    }
}
exports.forgotPassword = async (req, res) => {
    const {forgotEmail} = req.body;
    try {
        const user = await User.findOne({ where: { email:  forgotEmail} });
        if (user) {

            const randomUUID = uuidv4();

            await user.createForgotPassword({id: randomUUID, active: true})

            const client = Sib.ApiClient.instance;

            const apiKey = client.authentications['api-key'];
            apiKey.apiKey = process.env.SIB_KEY;


            const tranEmailApi = new Sib.TransactionalEmailsApi();

            const sender = {
                email: 'expensetracker@gmail.com'
            };
            const receivers = [
                {
                    email: forgotEmail,
                }
            ];

            const resetLink = `${process.env.WEBSITE}/reset-password/${randomUUID}`


            await tranEmailApi.sendTransacEmail({
                sender,
                to: receivers,
                subject: 'Reset your password',
                // textContent: `Your new password is ${newPassword}`,
                htmlContent: `<p>Visit the following link to reset your password:</p>
                <a href="${resetLink}">click here to reset password</a>`
            });
            res.json();
        } else {
            res.status(401).json();
        }
    } catch (err) {
        console.log(err);
        res.status(500).json();
    }
};
exports.resetPassword = async (req, res) => {
    try {
        const forogtPasswordElement = await ForgotPassword.findOne({where: {id: req.params.uId}})

        if (forogtPasswordElement && forogtPasswordElement.active) {
            await forogtPasswordElement.update({active: false})
            const htmlContent = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="/css/resetPassword.css">
                <title>Password Reset</title>
            </head>
            <body>
                <form action="${process.env.WEBSITE}/update-password/${req.params.uId}" method="GET">
                <h2>Password Reset</h2>
                <label for="newpassword">Enter New Password</label>
                <input name="newpassword" type="password" required>
                <button type="submit">Reset Password</button>
                </form>
            </body>
            </html>`
            res.send(htmlContent);
            res.end();
        } else {
            throw new Error('Password reset link expired or not found')
        }
    } catch (err) {
        res.status(500).json();
    }
    
};
exports.updatePassword = async (req, res) => {
    const {newpassword} = req.query;
    const {uId} = req.params;
    try {
        const result = await ForgotPassword.findOne({ where: { id: uId } })
        const hash = await bcryptjs.hash(newpassword, 10);
        await User.update({ password: hash }, {where: {id: result.userId}});
        res.send("Password Changed Success!");
    } catch (err) {
        res.status(500).json()
    }
};

exports.getUsers = async (req, res) => {
    try {
         const users = await User.findAll();
         res.status(201).json(users)
     } catch (err) {
             res.status(400).json();
     }
 }
exports.getGroups = async (req, res) => {
    try {
         const groups = await req.user.getGroups();
         res.status(201).json(groups)
     } catch (err) {
        console.log(err);
             res.status(400).json();
     }
 }
exports.addGroup = async (req, res) => {
    try {
        const { name, selectedMembers } = req.body;
        const newGroup = await Group.create({name, adminIds: [req.user.id]});

        const members = await User.findAll({ where: { name: selectedMembers } });

        await newGroup.addUsers(members);

        res.status(201).json({ message: 'Group created successfully.'});
     } catch (err) {
             res.status(400).json();
     }
 }
exports.getGroupMembers = async (req, res) => {
    try {
        const groupName = req.query.groupName;
        const group = await Group.findOne({where: {name: groupName}})

        const groupmembers = await group.getUsers();

        res.status(201).json({groupmembers, adminIds: group.adminIds});
     } catch (err) {
             res.status(400).json();
     }
 }
exports.makeUserAdmin = async (req, res) => {
    try {
        const userName = req.query.userName;
        const groupName = req.query.groupName;
        const user = await User.findOne({where: {name: userName}})
        const group = await Group.findOne({where: {name: groupName}})

        if (!group.adminIds.includes(user.id)) {
            const modifiedArray = [...group.adminIds, user.id]
            await Group.update({adminIds: modifiedArray}, {where: {id: group.id}})

            res.status(201).json({ message: 'user is now admin of the group'});
        } else {
            throw new Error('User is already admin');
        }
     } catch (err) {
             res.status(400).json({ message: err});
     }
 }
exports.removeUserFromGroup = async (req, res) => {
    try {
        const userName = req.query.userName;
        const groupName = req.query.groupName;
        const user = await User.findOne({where: {name: userName}})
        const group = await Group.findOne({where: {name: groupName}})

        await group.removeUser(user)
     } catch (err) {
             res.status(400).json();
     }
 }
exports.addUserToGroup = async (req, res) => {
    try {
        const userName = req.query.userName;
        const groupName = req.query.groupName;
        const user = await User.findOne({where: {name: userName}})
        const group = await Group.findOne({where: {name: groupName}})

        await group.addUser(user)
     } catch (err) {
             res.status(400).json();
     }
 }

exports.generateToken = generateToken;


