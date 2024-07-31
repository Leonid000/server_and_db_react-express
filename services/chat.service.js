const ConversationModel = require('../models/Conversation');
const MessageModel = require('../models/Message');
const customError = require('../extensions/customError');
const UserModel = require('../models/User');
const User = require('../models/User');
const { socket, getSocketID } = require('../WebSocket/socket');
const EventModel = require('../models/Event')

class chatService {
    async sendMessage(senderID, receiverID, message) {
        const newMessage = await MessageModel.create({
            senderID,
            receiverID,
            message,
        });
        const newMessage2 = await MessageModel.findById(newMessage._id)
        newMessage2._idString = newMessage._id
        await newMessage2.save()

        let conversation = await ConversationModel.findOne({
            participants: { $all: [senderID, receiverID] },
        });
        if (!conversation) {
            conversation = await ConversationModel.create({
                participants: [senderID, receiverID],
                participantsString: [senderID, receiverID],
            });
            conversation.messages.push(newMessage2._id);
            await conversation.save();
            const senderUSER = await UserModel.findById(senderID);
            const receiverUSER = await UserModel.findById(receiverID);

            const socketID_receiver = getSocketID(receiverID);
            if (socketID_receiver) {
                socket.to(socketID_receiver).emit('getMessage', {
                    scheme: 2,
                    user: {
                        userID: senderUSER._id,
                        username: senderUSER.username,
                        profileImage: senderUSER.profileImage,
                        avatar_collor: senderUSER.avatar_collor,
                        order_of_letters: senderUSER.order_of_letters,
                        messages: [newMessage2]
                    },
                    
                });
            }
            const socketID_sender = getSocketID(senderID);
            if (socketID_sender) {
                socket.to(socketID_sender).emit('getMessage', {
                    scheme: 2,
                    user: {
                        userID: receiverUSER._id,
                        username: receiverUSER.username,
                        profileImage: receiverUSER.profileImage,
                        avatar_collor: receiverUSER.avatar_collor,
                        order_of_letters: receiverUSER.order_of_letters,
                        messages: [newMessage2]
                    },
                });
            }
            //// Отправляем event о начале диолога 
            const authorEvent = await UserModel.findById(senderID)
            const event = await EventModel.create({
                type: 'newDialog',
                authorID: authorEvent._id,
                isReaded: false,
                message: `Пользователь ${authorEvent.username} начал диалог`
            })
            const eventReceiver = await UserModel.findById(receiverID)
            eventReceiver.events.unshift(event._id)
            await eventReceiver.save()
            const event2 = await EventModel.findById(event._id).populate('authorID','username profileImage avatar_collor order_of_letters')
            const socketID = getSocketID(eventReceiver._id)
            if(socketID){
                socket.to(socketID).emit('newDialogEvent', event2)
            }



            return;
        }

        conversation.messages.push(newMessage2._id);
        await conversation.save();

        const socketID_receiver = getSocketID(receiverID);
        if (socketID_receiver) {
            socket.to(socketID_receiver).emit('getMessage', {
                scheme: 1,
                message: newMessage2,
            });
        }
        const socketID_sender = getSocketID(senderID);
        if (socketID_sender) {
            socket.to(socketID_sender).emit('getMessage', {
                scheme: 1,
                message: newMessage2,
            });
        }

        // userID: senderUSER._id,
        // username: senderUSER.username,
        // profileImage: senderUSER.profileImage,
        // avatar_collor: senderUSER.avatar_collor,
        // order_of_letters: senderUSER.order_of_letters,
        // message: newMessage

        return;
    }

    async getMyConversations(myID) {
        const Conversations = await ConversationModel.find({
            participants: { $all: [myID] },
        });
        const myParticipantsID = [];

        Conversations.forEach((conversation) => {
            conversation.participantsString.forEach((participant) => {
                if (participant !== myID) {
                    myParticipantsID.push(participant);
                }
            });
        });

        const conversationUsers = await Promise.all(
            myParticipantsID.map(async (id) => {

                const dialog = await ConversationModel.findOne({
                    participants: { $all: [myID, id] },
                }).populate('messages')

                const mesReversve = dialog.messages.toReversed()
                const newMessageArray = []
                let count = 0
                let i = 30
                while (i >= count){
                    if(mesReversve[i]){
                        newMessageArray.push(mesReversve[i])
                    }
                    i--
                }

                const user = await UserModel.findById(id);
                return {
                    userID: user._id,
                    username: user.username,
                    profileImage: user.profileImage,
                    avatar_collor: user.avatar_collor,
                    order_of_letters: user.order_of_letters,
                    messages: newMessageArray
                };
            })
        );
        return { conversationUsers };
    }
    async getMessages(myID,whoChatWith,firstMessageID){
        const conversation = await ConversationModel.findOne({
            participants: {$all:[myID,whoChatWith]}
        }).populate('messages')
        const reversedMessages = conversation.messages.toReversed()
        const index = reversedMessages.findIndex(message => {
            return message._idString === firstMessageID
        })
        const addtionalMessages = []
        let i = index + 30
        while (i >= index){
            if(reversedMessages[i]){
                addtionalMessages.push(reversedMessages[i])
            }
            i--
        }
        
        return {messages: addtionalMessages, whoChatWith: whoChatWith}
    }
}

module.exports = new chatService();
