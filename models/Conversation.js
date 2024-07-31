const mongoose = require('mongoose')

const ConversationModel = mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    participantsString:[{
        type: String,
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: []
    }]
},{timestamps: true})

module.exports = mongoose.model('Conversation', ConversationModel)