const customError = require("../extensions/customError")


const validateRegistrationStage2 = (req,res,next) => {
    try{
        const errorMessages = {}
        if(Object.keys(req.body).length === 0) errorMessages.email = 'Поле email не может быть пустым'
        if(Object.keys(errorMessages).length !== 0){
           return res.status(400).json(errorMessages)
        }
        if(!Object.keys(req.body).includes('email')) errorMessages.email = 'Поле email не может быть пустым'
        if(Object.keys(errorMessages).length !== 0){
            return res.status(400).json(errorMessages)
        }
        const {email} = req.body
        const validEmail = email.match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
        if(!validEmail) errorMessages.email = 'Не валидный email'
        if(Object.keys(errorMessages).length !== 0){
            return res.status(400).json(errorMessages)
        }
        next()

    }catch(error){
        return customError.myError(res,500,'common','Внутренняя ошибка сервера')
    }

}


module.exports = validateRegistrationStage2