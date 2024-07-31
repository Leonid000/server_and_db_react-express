const mongoose = require('mongoose')

const EventModel = mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['like','comment', 'subscribe','unsubscribe','newDialog','newPost', 'newUser']
    },
    authorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isReaded: {
        type: Boolean,
        default: false
    },
    message:{
        type: String,
        required: true
    }
})


module.exports = mongoose.model('Event', EventModel)