const mongoose = require('mongoose')


const UserModel = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    roles: [{
        type: String,
        ref: 'Role',
        required: true
    }],
    gender: {
        type: String,
        required: true,
        enum: ['male','female']
    },
    profileImage: {
        type: String,
        required: true,
        default: ''
    },
    avatar_collor: {
        type: String,
        enum: ['red', 'gray' , 'blue' , 'yellow' , 'green' , 'purple','none']
    },
    
    order_of_letters: {
        type: String,
        enum: ['first_second','first_last','none']
    },
    registrationStage: {
        type: String,
        required: true,
        enum: ['none','created','email','code','done']
    },
    activationCode: {
        type: String,
        required: true
    },
    subscribers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    iSubscribeTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
    }],
    country: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: ''
    },
    work: {
        type: String,
        default: ''
    },
    age: {
        type: String,
        default: ''
    },
    bite: {
        type: String,
        default: ''
    },
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        default: [],
    }]

},{timestamps: true})


module.exports = mongoose.model('User', UserModel)