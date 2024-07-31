const mongoose = require('mongoose')


const TokenModel = mongoose.Schema({
    userID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    }
})


module.exports = mongoose.model('Token', TokenModel)