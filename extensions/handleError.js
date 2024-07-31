const customError = require('./customError')


module.exports = function(res,error){
    const errorMessages = {};
    if (error instanceof customError) {
        errorMessages[error.property] = error.message;
        return res.status(error.status).json({ errorMessages });
    }

    errorMessages.common = 'Общая ошибка сервера';
    res.status(500).json({ errorMessages, error });
}