


module.exports = class customError extends Error {
    status;
    property;
    constructor(status,property,message){
        super(message)
        this.status = status
        this.property = property
    }

    static myError(res,status,property,message){
        const errorMessages = {}
        errorMessages[property] = message
        return res.status(status).json({errorMessages})
    }

}

