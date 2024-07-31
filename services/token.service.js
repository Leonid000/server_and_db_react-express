const jwt = require('jsonwebtoken')
const TokenModel = require('../models/Token')

class tokenService {

    generateTokens(payload){
        const accessToken = jwt.sign(payload, process.env.ACCESS_CODE, {expiresIn: '30d'})
        const refreshToken = jwt.sign(payload, process.env.REFRESH_CODE, {expiresIn: '30d'})
        return {accessToken,refreshToken}
    }
    verifyAccessToken(accessToken){
        try{
            const userData = jwt.verify(accessToken, process.env.ACCESS_CODE)
            return userData
        }catch(error){
            return null
        }
    }
    verifyRefreshToken(refreshToken){
        try{
            const userData = jwt.verify(refreshToken, process.env.REFRESH_CODE)
            return userData
        }catch(error){
            return null
        }

    }
    async saveRefreshToken(userID,refreshToken){
        const token = await TokenModel.findOne({userID})
        if(token){
            token.refreshToken = refreshToken
            await token.save()
            return token
        }
        const newToken = await TokenModel.create({userID,refreshToken})
        return newToken
    }
    async findRefreshToken(refreshToken){
        const token = await TokenModel.findOne({refreshToken})
        return token
    }
    async removeRefreshToken(refreshToken){
        const tokenData = await TokenModel.deleteOne({refreshToken})
        return tokenData
    }
    

}



module.exports = new tokenService()