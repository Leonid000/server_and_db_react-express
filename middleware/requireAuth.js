const tokenService = require('../services/token.service')
const customError = require('../extensions/customError')



module.exports = function(rolesArray){
    return function(req,res,next){
        try{
            const accessToken = req.headers.authorization
            if(!accessToken){
                return customError.myError(res,401,'common','Пользователь не авторизован')
            }
            
            const userData = tokenService.verifyAccessToken(accessToken)
            if(!userData){
                return customError.myError(res,401,'common','Пользователь не авторизован')
            }
            let hasRole = false
            const {roles: userRoles} = userData
            rolesArray.forEach(role => {
                if(userRoles.includes(role)){
                    hasRole = true
                }
            })
            if(!hasRole){
                return customError.myError(res,401,'common','Пользователь не авторизован')
            }
            req.user = userData
            next()
        }catch(error){
            return customError.myError(res,500,'common','Внутренняя ошибка сервера')
        }
    }
}