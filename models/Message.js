const mongoose = require('mongoose')

const MessageModel = mongoose.Schema({
    _idString: {
        type: String,
    },
    senderID: {
        type: String,
        required: true
    },
    receiverID: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isReaded: {
        type: Boolean,
        required: true,
        default: false
    },
},{timestamps: true})

module.exports = mongoose.model('Message', MessageModel)
