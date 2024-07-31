

const handleError = require('../extensions/handleError')
const postsService = require('../services/posts.service')
const {socket} = require('../WebSocket/socket')

class postsController {
    async createPost(req,res){
        try{
            const {userID} = req.user
            const status  = Number(req.body.status)
            if(status === 2){
                const {topic,title,content} = req.body
                const {newPost} = await postsService.createNewPost_WithoutImage(topic,title,content,userID)
                socket.emit('getNewPost', {newPost})
                return res.status(201).json({newPost})
            } 
            if(status === 1){
                const {topic,title,content,postImage_object_fit} = req.body
                const postImage = `${process.env.SERVER_URL}/images/postsImages/${req.file.filename}`
                const {newPost} = await postsService.createNewPost_With_Image(topic,title,content,postImage_object_fit,postImage,userID)
                socket.emit('getNewPost', {newPost})
                return res.status(201).json({newPost})
            }
        }catch(error){
            console.log (error)
            handleError(res,error)
        }
    }

    async getMyPosts(req,res){
        try{
            const {userID} = req.user
            const {params} = req.params
            // _lastUserID=sdfj3j3234234
            const idOfLastPost = params.split('=')[1]
            const {posts} = await postsService.getMyPosts(userID,idOfLastPost)
            res.status(200).json({posts})
        }catch(error){
            handleError(res,error)
        }
    }
    async getUserPosts(req,res){
        try{
            const {params} = req.params
            const userID = params.split('&')[0].split('=')[1]
            const lastPostID = params.split('&')[1].split('=')[1]
            const {posts} = await postsService.getUserPosts(userID,lastPostID)
            res.status(200).json({posts})
        }catch(error){
            handleError(res,error)
        }
    }
    async getAllPosts(req,res){
        try{
            const {params} = req.params
            const lastPostID = params.split('=')[1]
            const {posts} = await postsService.getAllPosts(lastPostID)
            res.status(200).json({posts})
        }catch(error){
            handleError(res,error)
        }

    }
    async likePost(req,res){
        try{  
            const {userID} = req.user
            const {postID} = req.params
            await postsService.likePost(userID,postID)
            res.status(200).json({message: 'Успешно'})
            
        }catch(error){
            handleError(res,error)
        }

    }
    async getOnePost(req,res){
        try{  
            const {postID} = req.params
            const {post} = await postsService.getOnePost(postID)
            res.status(200).json({post})
        }catch(error){
            handleError(res,error)
        }

    }
    async deletePost(req,res){
        try{  
            const {postID} = req.params
            const {userID} = req.user
            const {deletedPostID} = await postsService.deletePost(postID,userID)
            socket.emit('deletePost', deletedPostID )
            res.status(204).json({deletedPostID})
        }catch(error){
            handleError(res,error)
        }

    }
    async deletePost(req,res){
        try{  
            const {postID} = req.params
            const {userID} = req.user
            const {deletedPostID} = await postsService.deletePost(postID,userID)
            socket.emit('deletePost', deletedPostID )
            res.status(204).json({deletedPostID})
        }catch(error){
            handleError(res,error)
        }

    }
    async updatePost(req,res){
        try{  
            const {postID} = req.params
            const {userID} = req.user
            const {type} = req.body
            if(Number(type) === 1){
                const {title,content,topic} = req.body
                const {updatedPost} = await postsService.updatePost_withoutImage(postID,userID,title,content,topic)
                socket.emit('updatedPost', updatedPost)
                return res.status(204).json({message: 'Пост изменен'})
            }
            if(Number(type) === 2){
                const {title,content,topic} = req.body
                const newPostImage = `${process.env.SERVER_URL}/images/postsImages/${req.file.filename}`
                const {updatedPost} = await postsService.updatePost_withImage(postID,userID,title,content,topic,newPostImage)
                socket.emit('updatedPost', updatedPost)
                return res.status(204).json({message: 'Пост изменен'})
            }
        }catch(error){
            handleError(res,error)
        }

    }
    async getLikes(req,res){
        try{  
            const {postID} = req.params
            const {likeUsers} =  await postsService.getLikes(postID)
            res.status(200).json({likeUsers})
        }catch(error){
            handleError(res,error)
        }

    }
}


module.exports = new postsController()