const express = require('express')
const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const usersController = require('./users.controller')



router.get('/getUsers', requireAuth(["USER"]), usersController.getUsers)
router.get('/getUser/:id', usersController.getUser),
router.post('/subscribeTo/:id', requireAuth(["USER"]),usersController.subscribeTo )
router.delete('/unSubscribeTo/:id',requireAuth(["USER"]),usersController.unSubscribeTo )


module.exports = router