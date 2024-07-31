const ConversationModel = require('../models/Conversation')





const isReadMessageOn = (getSocketID,socket) => {
    return async ({myID, whoChatWith}) => {
        let conversation = await ConversationModel.findOne({
            participants: {$all:[myID,whoChatWith]}
        }).populate('messages')
        const reversedMessages = conversation.messages.toReversed()
        const readedMessages = []
        let i = 0
        while (i < reversedMessages.length){
            if(reversedMessages[i].senderID === whoChatWith){
                if(reversedMessages[i].isReaded) break
                reversedMessages[i].isReaded = true
                await reversedMessages[i].save()
                readedMessages.push(reversedMessages[i])
            }
            i++
        }
        const socketID = getSocketID(whoChatWith)
        const socketID_2 = getSocketID(myID)
        if(socketID) socket.to(socketID).emit('newReadedMessages',{
            user: myID,
            readedMessages
        })
        if(socketID_2) socket.to(socketID_2).emit('newReadedMessages',{
            user: whoChatWith,
            readedMessages
        })
        
    }
}


module.exports = isReadMessageOn;
