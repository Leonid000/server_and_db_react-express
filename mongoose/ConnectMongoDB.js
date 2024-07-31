const mongoose = require('mongoose')

const ConnectMongoDB = async () => {
    try{
        await mongoose.connect(process.env.DB_LINK)
        console.log('Connection MongoDB success')
    }catch(error){
        console.log(`Error to conntction MongoDB`, error)
    }
}

module.exports = ConnectMongoDB