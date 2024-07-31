

const MessageModel = require('../models/Message')


const isReadOneMessage = (getSocketID,socket) => {
    return async ({myID,senderID,messageID}) => {
        const message = await MessageModel.findById(messageID)
        message.isReaded = true
        await message.save()
        const message2 = await MessageModel.findById(messageID)
        const socketID_senderID= getSocketID(senderID)
        if(socketID_senderID){
            socket.to(socketID_senderID).emit('oneReadedMessage', {
                userID: myID,
                message: message2
            })
        }
           
        
    }
}

module.exports = isReadOneMessage