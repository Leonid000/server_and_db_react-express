const customError = require('../extensions/customError')
const handleError = require('../extensions/handleError')
const userService = require('../services/user.service')
const {socket} = require('../WebSocket/socket')

class usersController {
    async getUsers(req,res){
        try{
            const {userID} = req.user
            const {users} = await userService.getUsers(userID)
            res.status(200).json({users})
        }catch(error){
            handleError(res,error)
        }
    }
    
    async getUser(req,res){
        try{
            const {id} = req.params
            const {user} = await userService.getUser(id)
            res.status(200).json({user})
        }catch(error){
            const errorMessages = {};
            if (error instanceof customError) {
                errorMessages[error.property] = error.message;
                return res.status(error.status).json({ errorMessages });
            }
            errorMessages.common = error.message;
            res.status(400).json({ errorMessages });
        }
    }
    async subscribeTo(req,res){
        try{
            const {userID} = req.user
            const {id} = req.params
            const {subscriberID, whoSubscribeTo} = await userService.subscrbeTo(userID,id)
            socket.emit('subscribe', {subscriberID,whoSubscribeTo})
            res.status(200).json({message: 'Вы успешно подписались'})
        }catch(error){
            handleError(res,error)
        }
    }
    async unSubscribeTo(req,res){
        try{
            const {userID} = req.user
            const {id} = req.params
            const {unsubscriberID, whoUnsubscrbeTo} = await userService.unSubscribeTo(userID,id)
            socket.emit('unSubscribe', {unsubscriberID,whoUnsubscrbeTo})
            res.status(200).json({message: 'Вы успешно отписались'})
        }catch(error){
            handleError(res,error)
        }
    }
}



module.exports = new usersController()