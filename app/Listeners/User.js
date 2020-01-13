'use strict'
const Mail = use('Mail')
const Env = use('Env')

const User = exports = module.exports = {}

User.novo = async (dados) => {
    console.log('estou dentro do evento new::user')
        
    await Mail.send('auth.emails.confirm_email', dados, message => {
        message.to(dados.email)
        .from(Env.get('MAIL_USERNAME'))
        .subject('please confirm your wifianywhere  account')
    })
}

User.resetpassword = async (dados) => {
    console.log('estou dentro do evento user::passwordreset')

    await Mail.send('auth.emails.password_reset', dados, message => {
        message.to(dados.user.email)
        .from(Env.get('MAIL_USERNAME'))
        .subject('password reset link')
    })
}
 
