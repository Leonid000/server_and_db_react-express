const express = require('express')
const router = express.Router()

const roleController = require('./role.controller')




router.get('/createRoles', roleController.initializeRoles)


module.exports = router