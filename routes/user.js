const express = require('express');
const userController = require('../controllers/user');
const userAuthentication = require('../middleware/auth');


const router = express.Router();

router.post('/signup', userController.signup)
router.post('/login', userController.login)
router.post('/forgotPassword', userController.forgotPassword)
router.get('/reset-password/:uId', userController.resetPassword)
router.get('/update-password/:uId', userController.updatePassword)


router.get('/getUsers', userAuthentication.auth, userController.getUsers)
router.get('/getGroups', userAuthentication.auth, userController.getGroups)
router.post('/addGroup', userAuthentication.auth, userController.addGroup)
router.get('/getGroupMembers', userAuthentication.auth, userController.getGroupMembers)
router.get('/makeUserAdmin', userAuthentication.auth, userController.makeUserAdmin)
router.get('/removeUserFromGroup', userAuthentication.auth, userController.removeUserFromGroup)
router.get('/addUserToGroup', userAuthentication.auth, userController.addUserToGroup)

module.exports = router;