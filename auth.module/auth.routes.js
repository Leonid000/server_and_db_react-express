const express = require('express')
const router = express.Router()


const authController = require('./auth.controller')
const valid_MDW_S1 = require('../middleware/validateRegistrationStage1')
const valid_MDW_S2 = require('../middleware/validateRegistrationStage2')
const requireAuth = require('../middleware/requireAuth')
const multer_profileImages = require('../middleware/multerProfileImages')

router.post('/registration/stage1',valid_MDW_S1, authController.registrationStage1)
router.post('/registration/stage2',valid_MDW_S2, requireAuth(["USER"]),authController.registrationStage2)
router.post('/registration/stage3',requireAuth(["USER"]),authController.registrationStage3)
router.post('/registration/stage4',requireAuth(["USER"]),multer_profileImages.single('profileImage'), authController.registrationStage4)
router.post('/login', authController.login)
router.get('/refresh', authController.refresh)
router.get('/logout', authController.logout)
router.put('/editUser',requireAuth(["USER"]),multer_profileImages.single('profileImage'),authController.editUser )
router.delete('/deleteEvents',requireAuth(["USER"]),authController.deleteEvents)

router.get('/users',requireAuth(["USER"]),(req,res) => {
    const {userID} = req.user
    res.status(200).json(userID)
})




module.exports = router