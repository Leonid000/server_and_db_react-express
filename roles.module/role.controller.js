const customError = require('../extensions/customError')
const roleService = require('../services/role.service')




class roleController {
    async initializeRoles(req,res){
        try{
            const results = await roleService.initialize_Roles()
            res.status(201).json({message: 'Роли были успешно созданны', ...results})
        }catch(error){
            if(error instanceof customError){
                res.status(error.status).json({message: error.message})
            }else{
                res.status(500).json({message:'Внутренняя ошибка сервера'})
            }
        }
    }
}

module.exports = new roleController()