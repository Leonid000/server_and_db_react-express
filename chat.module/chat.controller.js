
const handleError = require('../extensions/handleError')
const chatService = require('../services/chat.service')

class chatController {
    async sendMessage(req,res){
        try{
            const {receiverID} = req.params
            const {userID: senderID} = req.user
            const {message} = req.body
            await chatService.sendMessage(senderID,receiverID,message)
            res.status(201).json({message: 'Сообщение созданно' })
        }catch(error){
            handleError(res,error)
        }
    }
    async getConversations(req,res){
        try{
            const {userID} = req.user
            const {conversationUsers} = await chatService.getMyConversations(userID)
            res.status(200).json({conversationUsers})
        }catch(error){
            handleError(res,error)
        }
    }
    async getMessages(req,res){
        try{
            const {userID} = req.user
            const {params} = req.params
            const whoChat = params.split('&')[0].split('=')[1]
            const firstMessageID = params.split('&')[1].split('=')[1]
            const {messages,whoChatWith } = await chatService.getMessages(userID,whoChat,firstMessageID)
            res.status(200).json({messages, whoChatWith})
        }catch(error){
            handleError(res,error)
        }
    }
    
    

}


module.exports = new chatController()