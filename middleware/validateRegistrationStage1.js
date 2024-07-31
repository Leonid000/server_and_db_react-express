const e = require("cors")
const customError = require("../extensions/customError")



const validateRegistrationStage1 = (req,res,next) => {
    try{
        
        const errorMessages = {}
        if(Object.keys(req.body).length === 0) {
            errorMessages.username = 'Поле Username не может быть путым'
            errorMessages.password = 'Поле Password не может быть путым'
            errorMessages.gender = 'Гендер обязательно должен быть указан'
        }
        if(Object.keys(errorMessages).length !== 0){
            return res.status(400).json({errorMessages})
        }

        if(!Object.keys(req.body).includes('username')) errorMessages.username = 'Поле Username не может быть путым'
        if(!Object.keys(req.body).includes('password')) errorMessages.password = 'Поле Password не может быть путым'
        if(!Object.keys(req.body).includes('gender')) errorMessages.gender = 'Поле gender не может быть путым'
        if(Object.keys(errorMessages).length !== 0){
            return res.status(400).json({errorMessages})
        }
        
        if(req.body.username.length < 6) errorMessages.username = 'Поле Username должно быть больше 5 символов'
        if(req.body.password.length < 6) errorMessages.password = 'Поле Password должно быть больше 5 символов'

        const genderArray = ['male','female']      
        if(!genderArray.some(gender => {
            return gender == req.body.gender
        })) errorMessages.gender = 'Поле Gender обязательно'

        if(Object.keys(errorMessages).length !== 0){
            return res.status(400).json({errorMessages})
        }

        next()

    }catch(error){
        return customError.myError(res,500,'common','Внутренняя ошибка сервера')
    }
}

module.exports = validateRegistrationStage1