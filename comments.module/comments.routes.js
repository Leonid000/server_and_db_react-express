const express = require('express')
const router = express.Router()


const commentsController = require('./comments.controller')
const requireAuth = require('../middleware/requireAuth')

router.post('/createComment/:postID',requireAuth(["USER"]),commentsController.createComment)
router.get('/getCommentsForPost/:params',commentsController.getCommentsForPost)
router.delete('/deleteComment/:params', requireAuth(['USER']), commentsController.deleteComment)

module.exports = router