const express = require('express');
const { register, login, addFolder, getFolder, addBokmrks, getBokmrks, getUser } = require('../controller/controller');

const router = new express.Router()
router.post('/register',register)
router.post('/login',login)
router.post('/addFolder/',addFolder)
router.get('/getFolder/:userId/',getFolder)
 router.post('/addBokmrks/:userId',addBokmrks);
 router.get('/getBokmrks/:userId/',getBokmrks)
 router.get('/getUser/:userId/',getUser)
module.exports=router;