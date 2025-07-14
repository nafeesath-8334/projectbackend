const express = require('express');
const { register, login, addFolder, getFolder, addBokmrks, getBokmrks, getUser, editFolder, forgotPswd, resetPassword, deleteFolder, editUser, editBokmark, deleteBokmrk,  } = require('../controller/controller');
const jwtMiddleware =require('../middleware/jwtMiddleware')
const multer = require("multer");
const upload = multer();
// const upload = require('../middleware/multerMiddleware')
const router = new express.Router()
router.post('/register',register)
router.post('/login',login)
router.post('/addFolder/',addFolder)
router.get('/getFolder/:userId/',getFolder)
 router.post('/addBokmrks/:userId',addBokmrks);
 router.get('/getBokmrks/:userId/',getBokmrks)
 router.get('/getUser/:userId/',getUser)
 router.put("/editUser/:userId/",jwtMiddleware,upload.single("img"),editUser)
  router.post('/forgotPassword',forgotPswd)
  router.post('/resetPassword/:token',resetPassword)
 router.post('/editFolder',editFolder)
router.delete('/deleteFolder',deleteFolder)
router.put("/editBokmrk/:bokmrkId/",jwtMiddleware,editBokmark)
router.delete('/deleteBokmrk', deleteBokmrk);


module.exports=router;