const express = require('express')
const router = express.Router()
const requireAuth = require('../middleware/requireAuth')
const chatController = require('./chat.controller')

router.post('/sendMessage/:receiverID',requireAuth(["USER"]), chatController.sendMessage)
router.get('/getMyConversations', requireAuth(["USER"]),chatController.getConversations)
router.get('/getMessages/:params',requireAuth(["USER"]), chatController.getMessages ) 


module.exports = router 