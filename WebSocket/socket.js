const express = require('express')
const app = express()
const server = require('http').createServer(app)
const socket = require('socket.io')(server,{
    cors: {
        origin: '*'
    }
})

const isReadMessageOn = require('./socketReadMessageOn')
const isReadOneMessage = require('./socketReadOneMessage')

const onlineUsers = {}

const getSocketID = (receiverID) => {
    return onlineUsers[receiverID]
    
}


socket.on('connection', (client) => {
    const {userID} = client.handshake.query
    if(userID) onlineUsers[userID] = client.id
    socket.emit('getOnlineUsers', Object.keys(onlineUsers))
    client.on('isReadMessageOn', isReadMessageOn(getSocketID,socket))
    client.on('isReadOneMessage',isReadOneMessage(getSocketID,socket))

    client.on('disconnect', () => {
        delete onlineUsers[userID]
        socket.emit('getOnlineUsers', Object.keys(onlineUsers))
    })
})



module.exports = {express,app,server,socket,getSocketID}