const mongoose = require('mongoose')



const RoleModel = mongoose.Schema({
    value:{
        type: String,
        required: true,
        unique: true
    }
})



module.exports = mongoose.model('Role', RoleModel)