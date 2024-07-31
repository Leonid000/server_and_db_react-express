const mongoose = require('mongoose')

const PostModel = mongoose.Schema({
    authorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _idString: {
        type: String,
    },
    authorName: {
        type: String,
        required: true,
    },
    postImage: {
        type: String,
        default: ''
    },
    postImage_object_fit: {
        type: String,
        required: true,
        enum: ['cover','contain', 'none'],
        default: 'none'
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true,
        enum: ['nature','pet','food','traveling','animals']
    },
    views: {
        type: Number,
        required: true,
        default: 0
    },
    likes: [{
        type: String,
        required: true,
        default:[]
    }],
    date: {
        type: String,
        required: true
    },
    commentsAmount: {
        type: Number,
        required: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]

},{timestamps: true})


module.exports = mongoose.model("Post", PostModel)

