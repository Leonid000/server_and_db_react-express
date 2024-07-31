const mongoose = require('mongoose')


const CommentModel = mongoose.Schema({
    _idString: {
        type: String
    },
    authorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    
},{timestamps: true})

module.exports = mongoose.model("Comment", CommentModel)


