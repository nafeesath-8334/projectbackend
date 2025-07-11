const express = require('express');
const { register, login, addFolder, getFolder, addBokmrks, getBokmrks, getUser, editFolder, forgotPswd, resetPassword, deleteFolder, editUserDetails } = require('../controller/controller');
const jwtMiddleware =require('../middleware/jwtMiddleware')
const upload = require('../middleware/multerMiddleware')
const router = new express.Router()
router.post('/register',register)
router.post('/login',login)
router.post('/addFolder/',addFolder)
router.get('/getFolder/:userId/',getFolder)
 router.post('/addBokmrks/:userId',addBokmrks);
 router.get('/getBokmrks/:userId/',getBokmrks)
 router.get('/getUser/:userId/',getUser)
 router.put("/editUserDetails/:userId/",jwtMiddleware,upload.single("img"),editUserDetails)
  router.post('/forgotPassword',forgotPswd)
  router.post('/resetPassword/:token',resetPassword)
 router.post('/editFolder',editFolder)
router.delete('/deleteFolder',deleteFolder)
module.exports=router;