const customError = require('../extensions/customError');
const userService = require('../services/user.service');
const handleError = require('../extensions/handleError')
const {socket} = require('../WebSocket/socket')

class authController {
    async registrationStage1(req, res) {
        try {
            const { username, password, gender } = req.body;
            const result = await userService.registrationStage1(username, password, gender);
            res.cookie('refreshToken', result.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            res.status(201).json({ ...result });
        } catch (error) {
           handleError(res,error)
        }
    }

    async registrationStage2(req, res) {
        try {
            const { userID } = req.user;
            const { email } = req.body;
            const result = await userService.registrationStage2(userID, email);
            res.status(201).json({ ...result });
        } catch (error) {
            handleError(res,error)
        }
    }
    async registrationStage3(req, res) {
        try {
            const { userID } = req.user;
            const { code } = req.body;
            const result = await userService.registrationStage3(userID, code);
            res.status(201).json({ ...result });
        } catch (error) {
            handleError(res,error)
        }
    }
    async registrationStage4(req, res) {
        try {
            const { userID } = req.user;
            const count = Number(req.body.count);
            let profileImage;
            let avatar_collor = ''
            let order_of_letters = ''
            if (count === 1) {
                profileImage = ''
                avatar_collor = req.body.avatar_collor
                order_of_letters = req.body.order_of_letters
            }
            if (count === 2) {
                profileImage = `${process.env.SERVER_URL}/images/profileImages/${req.file.filename}`;
            }
            console.log(userID, profileImage,avatar_collor,order_of_letters)
            const result = await userService.registrationStage4(userID, profileImage,avatar_collor,order_of_letters);
            res.status(201).json({...result});
        } catch (error) {
            handleError(res,error)
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const result = await userService.login(username, password);
            res.cookie('refreshToken', result.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            res.status(200).json({ ...result });
        } catch (error) {
            handleError(res,error)
        }
    }
    async refresh(req, res) {
        try {
            const { refreshToken } = req.cookies;
            const result = await userService.refresh(refreshToken);
            res.cookie('refreshToken', result.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            res.status(200).json({ ...result });
        } catch (error) {
            handleError(res,error)
        }
    }
    
    async logout(req, res) {
        try {
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken)
            res.clearCookie('refreshToken')
            return res.status(200).json({message: 'LogOut'})
            
        } catch (error) {
            handleError(res,error)
        }
    }
    async editUser(req,res){
        try {
            const {userID} = req.user
            const {type,username,country,city,work,age,bite} = req.body 
            if(Number(type) === 1){
                const profileImage = undefined
                const {user} = await userService.editUser({userID,profileImage,username,country,city,work,age,bite}) 
                socket.emit('editUser',{user})
                return res.status(200).json({user})
            }
            if(Number(type) === 2){
                const profileImage = `${process.env.SERVER_URL}/images/profileImages/${req.file.filename}`
                const {user} =  await userService.editUser({userID,profileImage,username,country,city,work,age,bite})
                socket.emit('editUser',{user})
                return res.status(200).json({user})
            }
        } catch (error) {
            handleError(res,error)
        }
    }

    async deleteEvents(req,res){
        try{
            const {userID} = req.user
            await userService.deleteEvents(userID)
            res.status(200).json({type: 1})
        }catch(error){
            handleError(res,error)
        }
    }
}

module.exports = new authController();
