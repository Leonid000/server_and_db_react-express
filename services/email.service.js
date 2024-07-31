const nodemailer = require('nodemailer')


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

const mailer = async (email,message) => {
    transporter.sendMail({
        from: `Код активации для соцсети <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Активация',
        text: '',
        html: `
            <div>
            <h1>Ваш код активации</h1>
            <h2>${message}</h2>
            </div>
        `
    })
}


module.exports = mailer

