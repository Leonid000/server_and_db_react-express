const express = require('express')
const router = express.Router()



const requireAuth = require('../middleware/requireAuth')
const postsController = require('./posts.controller')
const multer_PostsImage = require('../middleware/multer_Posts_Images')

router.post('/createPost', requireAuth(["USER"]), multer_PostsImage.single('postImage'), postsController.createPost)
router.get('/getMyPosts/:params', requireAuth(["USER"]),postsController.getMyPosts)
router.get('/getUserPosts/:params',postsController.getUserPosts)
router.get('/getAllPosts/:params',postsController.getAllPosts)
router.get('/likePost/:postID',requireAuth(["USER"]), postsController.likePost)
router.get('/getOnePost/:postID',requireAuth(["USER"]), postsController.getOnePost)
router.delete('/deletePost/:postID', requireAuth(["USER"]),postsController.deletePost)
router.put('/updatePost/:postID',requireAuth(["USER"]), multer_PostsImage.single('postImage'), postsController.updatePost)
router.get('/getLikes/:postID',requireAuth(["USER"]), postsController.getLikes)



module.exports = router