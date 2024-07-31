const customError = require('../extensions/customError')
const RoleModel = require('../models/Role')




class roleService {
    async initialize_Roles(){
        try{
            const USER = await RoleModel.create({
                value: "USER"
            })
            const ADMIN = await RoleModel.create({
                value: "ADMIN"
            })
            return {USER,ADMIN}
        }catch(error){
            throw new customError(500, 'common', 'Внутренняя ошибка сервера')
        }
    }
}

module.exports = new roleService()