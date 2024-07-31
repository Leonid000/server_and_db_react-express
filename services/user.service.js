const UserModel = require('../models/User');
const RoleModel = require('../models/Role');
const customError = require('../extensions/customError');
const bctypt = require('bcryptjs');
const uuid = require('uuid');
const tokenService = require('./token.service');
const mailer = require('./email.service');
const UserDTO = require('../DTO/UserDTO');
const EventModel = require('../models/Event')
const {socket,getSocketID} = require('../WebSocket/socket')
const roleService = require('../services/role.service')

class userService {
    async registrationStage1(username, password, gender) {
       
        const candidate = await UserModel.findOne({ username });
        if (candidate) {
            throw new customError(400, 'username', 'username уже занят');
        }
        let getRole = await RoleModel.findOne({ value: 'USER' });
        if(!getRole){
            await roleService.initialize_Roles()
            getRole = await RoleModel.findOne({ value: 'USER' });
        }
        const hashPassword = bctypt.hashSync(password, 7);
        const activationCode = uuid.v1().split('-')[0];
        const newUser = await UserModel.create({
            username,
            password: hashPassword,
            gender,
            email: 'none',
            roles: [getRole.value],
            profileImage: 'none',
            registrationStage: 'created',
            activationCode,
            avatar_collor: 'none',
            order_of_letters: 'none',
            subscribers: [],
            iSubscribeTo: [],
            country: '',
            city: '',
            work: '',
            age: '',
            bite: '',
            events: []
        });
        
        const event = await EventModel.create({
            type: 'newUser',
            authorID: newUser._id,
            isReaded: false,
            message: ' Добро пожаловать. Ваш аккаунт был успешно создан.'
        })
        newUser.events.unshift(event._id)
        await newUser.save()

        const userDTO = UserDTO(newUser);
        const tokens = tokenService.generateTokens({
            userID: userDTO.userID,
            roles: userDTO.roles,
        });
        await tokenService.saveRefreshToken(userDTO.userID, tokens.refreshToken)
        return { ...tokens, user: userDTO };
    }

    async registrationStage2(userID, email) {

        const user = await UserModel.findOne({ _id: userID });
        if (!user) {
            throw new customError(401, 'common', 'Вы не авторизованны');
        }
        const hasEmail = await UserModel.findOne({ email });
        if (hasEmail) {
            if (toString(hasEmail._id) !== toString(user._id)) {
                throw new customError(400, 'email', `${hasEmail._id} ${user._id}`);
            }
        }
        user.email = email;
        user.registrationStage = 'email';
        await user.save();
        await mailer(email, user.activationCode)
        const newUser = await UserModel.findOne({ _id: userID });
        const userDTO = UserDTO(newUser);
        return { user: userDTO };
    }

    async registrationStage3(userID, code) {
        const user = await UserModel.findOne({ _id: userID });
        if (!user) {
            throw new customError(401, 'common', 'Вы не авторизованны');
        }
        const validCode = String(user.activationCode) === String(code) ? true : false;
        if (!validCode) {
            throw new customError(400, 'code', 'Не валидный код');
        }
        user.registrationStage = 'code';
        user.activationCode = 'none';
        await user.save();
        const newUser = await UserModel.findOne({ _id: userID });
        const userDTO = UserDTO(newUser);
        return { user: userDTO };
    }
    async registrationStage4(userID, profileImage,avatar_collor,order_of_letters) {
        const user = await UserModel.findOne({ _id: userID })           
        if (!user) {
            throw new customError(401, 'common', 'Вы не авторизованны');
        }
        if(profileImage === ''){
            user.profileImage = 'none'
            user.avatar_collor = avatar_collor,
            user.order_of_letters = order_of_letters
            user.registrationStage = 'done'
           
        }
        if(profileImage){
            user.profileImage = profileImage;
            user.registrationStage = 'done';
            
        }
        await user.save();
        const newUser = await UserModel.findOne({ _id: userID }).populate([
            {
                path: 'subscribers',
                select: 'username profileImage avatar_collor order_of_letters'
            },
            {
                path: 'iSubscribeTo',
                select: 'username profileImage avatar_collor order_of_letters'
            },
            {
                path: 'events',
                populate: {
                    path: 'authorID',
                    select: 'username profileImage avatar_collor order_of_letters'
                },
                
            }
        ])    
        const userDTO = UserDTO(newUser);
        return { user: userDTO };
    }
    async login(username, password) {
        const newUser = await UserModel.findOne({ username }).populate([
            {
                path: 'subscribers',
                select: 'username profileImage avatar_collor order_of_letters'
            },
            {
                path: 'iSubscribeTo',
                select: 'username profileImage avatar_collor order_of_letters'
            },
            {
                path: 'events',
                populate: {
                    path: 'authorID',
                    select: 'username profileImage avatar_collor order_of_letters'
                },
                
            }
        ])  
        if (!newUser) {
            throw new customError(400, 'username', 'Username не найден');
        }
        const validPassword = bctypt.compareSync(password, newUser.password);
        if (!validPassword) {
            throw new customError(400, 'password', 'Неверный пароль');
        }
        const userDTO = UserDTO(newUser);
        const tokens = tokenService.generateTokens({
            userID: userDTO.userID,
            roles: userDTO.roles,
        });
        await tokenService.saveRefreshToken(userDTO.userID, tokens.refreshToken)
        return { ...tokens, user: userDTO };
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw new customError(401, 'common', 'Вы не авторизованны');
        }
        const userData = tokenService.verifyRefreshToken(refreshToken);
        const hasToken = await tokenService.findRefreshToken(refreshToken);
        if (!userData || !hasToken) {
            throw new customError(401, 'common', 'Вы не авторизованны');
        }
        const user = await UserModel.findOne({_id: userData.userID}).populate([
            {
                path: 'subscribers',
                select: 'username profileImage avatar_collor order_of_letters'
            },
            {
                path: 'iSubscribeTo',
                select: 'username profileImage avatar_collor order_of_letters'
            },
            {
                path: 'events',
                populate: {
                    path: 'authorID',
                    select: 'username profileImage avatar_collor order_of_letters'
                },
                
            }
        ])    
        const userDTO = UserDTO(user)
        const tokens = tokenService.generateTokens({
            userID: userDTO.userID,
            roles: userDTO.roles
        })
        await tokenService.saveRefreshToken(userDTO.userID, tokens.refreshToken)
        return {
            ...tokens,
            user: userDTO 
        }
    }
    async logout(refreshToken){
       const token = await tokenService.removeRefreshToken(refreshToken)
       return token
    }

    async getUsers(myID){
        const users = await UserModel.find({_id: {$ne: myID}}).select('-password')
        return {users}
    }

    async getUser(id){
        const user = await UserModel.findOne({_id: id})
            .select('-password')
            .populate('subscribers', 'username profileImage avatar_collor order_of_letters')
            .populate('iSubscribeTo', 'username profileImage avatar_collor order_of_letters')
        return {user}
    }
    async subscrbeTo(userID,whoSubscribeTo){
        let user1 = await UserModel.findById(userID)
        let user2 = await UserModel.findById(whoSubscribeTo)
        const isSubscribe = user2.subscribers.some(subscriberID => {
            return String(subscriberID) === userID
        })
        if(isSubscribe){
            throw new customError(400,'common','Вы уже подписанны')
        }
        user1.iSubscribeTo.unshift(user2._id)
        user2.subscribers.unshift(user1._id)
        await user1.save()
        await user2.save()
        const ppp1 = await UserModel.findById(user1._id).select('username profileImage avatar_collor order_of_letters')
        const ppp2 = await UserModel.findById(user2._id).select('username profileImage avatar_collor order_of_letters')
        //// отправляем event тому, на кого подписались 
        const eventAuthor = await UserModel.findById(userID)
        const event = await EventModel.create({
            type: 'subscribe',
            authorID: eventAuthor._id,
            isReaded: false,
            message: `Пользователь ${eventAuthor.username} подписался на вас`
        })
        const eventReceiver = await UserModel.findById(whoSubscribeTo)
        eventReceiver.events.unshift(event._id)
        await eventReceiver.save()
        const event2 = await EventModel.findById(event._id).populate('authorID','username profileImage avatar_collor order_of_letters')
        const socketID = getSocketID(eventReceiver._id)
        if(socketID){
            socket.to(socketID).emit('subscribeEvent', event2)
        }

        return {subscriberID: ppp1, whoSubscribeTo: ppp2}

    }
    async unSubscribeTo(userID, whoUnsubscrbeTo){
        let user1 = await UserModel.findById(userID)
        let user2 = await UserModel.findById(whoUnsubscrbeTo)
        const isSubscribe = user2.subscribers.some(subscriberID => {
            return String(subscriberID) === userID
        })
        if(!isSubscribe){
            throw new customError('400','common','Вы не подписанны')
        }
        user1.iSubscribeTo.pull({_id: whoUnsubscrbeTo})
        user2.subscribers.pull({_id: userID})
        await user1.save()
        await user2.save()
        const ppp1 = await UserModel.findById(user1._id).select('username profileImage avatar_collor order_of_letters')
        const ppp2 = await UserModel.findById(user2._id).select('username profileImage avatar_collor order_of_letters')
        /// Отправляем event тому от кого отписались
        const eventAuthor = await UserModel.findById(userID)
        const event = await EventModel.create({
            type: 'unsubscribe',
            authorID: eventAuthor._id,
            isReaded: 'false',
            message: `Пользователь ${eventAuthor.username} отписался от вас`
        })
        const eventReceiver = await UserModel.findById(whoUnsubscrbeTo)
        eventReceiver.events.unshift(event._id)
        await eventReceiver.save()
        const event2 = await EventModel.findById(event._id).populate('authorID', 'username profileImage avatar_collor order_of_letters' )
        const socketID = getSocketID(eventReceiver._id)
        if(socketID){
            socket.to(socketID).emit('unsubscribeEvent', event2)
        }
        return {unsubscriberID: ppp1, whoUnsubscrbeTo: ppp2 }
    }

    async editUser({userID,profileImage,username,country,city,work,age,bite}){
        const isHasNewUsername = await UserModel.findOne({username: username})
        const user = await UserModel.findById(userID)
        if(isHasNewUsername){
            if(String(isHasNewUsername._id)!== userID ){
                throw new customError(400,'username','USERNAME занят')
            }
        }
        if(profileImage === undefined){
            user.username = username
            user.country = country
            user.city = city
            user.work = work
            user.age = age
            user.bite = bite
            await user.save()
            const user2 = await UserModel.findById(userID).select('-password').populate('subscribers').populate('iSubscribeTo')
            return {user:user2}
        }
        if(profileImage){
            user.profileImage = profileImage
            user.username = username
            user.country = country
            user.city = city
            user.work = work
            user.age = age
            user.bite = bite
            await user.save()
            const user2 = await UserModel.findById(userID).select('-password').populate('subscribers').populate('iSubscribeTo')
            return {user:user2}
        }
    }
    async deleteEvents(userID){
        const user = await UserModel.findById(userID)
        user.events.forEach(async(eventID) => {
            await EventModel.deleteOne({_id: String(eventID)})
        })
        user.events = []
        await user.save()
        return
    }
    
}

module.exports = new userService();
