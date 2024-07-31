


const commentsService = require('../services/comments.service')
const handleError = require('../extensions/handleError')


class commentsController {
    async createComment (req,res){
        try{
            const {userID} = req.user
            const {postID} = req.params
            const {comment} = req.body
            await commentsService.createComment(userID,postID,comment)
            res.status(201).json({message: 'Коммент создан'})
        }catch(error){
            handleError(res,error)
        }
    }
    async getCommentsForPost (req,res){
        try{
            const {params} = req.params
            const postID = params.split('&')[0].split('=')[1]
            const lastCommentID = params.split('&')[1].split('=')[1]
            const {comments} = await commentsService.getCommentsForPost(postID,lastCommentID)
            res.status(200).json({postID, comments})
        }catch(error){
            handleError(res,error)
        }
    }
    async deleteComment(req,res){
        try{
            console.log ('1 Пришел запрос на удаление комментария')
            const {userID} = req.user
            const {params} = req.params
            const commentID = params.split('&')[0].split('=')[1]
            const postID = params.split('&')[1].split('=')[1]
            await commentsService.deleteComment(userID,commentID,postID)
            console.log ('7 Удаление выполненно')
            console.log ('-----------------------------------')
            res.status(200).json({message: 'Выполнено'})
        }catch(error){
            handleError(res,error)
        }
    }

}




module.exports = new commentsController()