const mongoose = require('mongoose')



const AlerModel = mongoose.Schema({
    type_of_alert: {
        type: String,
        required: true,
        enum: ['like']
    },
    message: {
        type: String,
        required: true
    }

})


module.exports = mongoose.model('Alert', AlerModel)