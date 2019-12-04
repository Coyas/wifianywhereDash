'use strict'
const Mail = use('Mail')
const Env = use('Env')

const User = exports = module.exports = {}

User.novo = async (dados) => {
    console.log('estou dentro do evento new::user')
        
    await Mail.send('auth.emails.cliente_confirm_email', dados, message => {
        message.to(dados.email)
        .from(Env.get('MAIL_USERNAME'))
        .subject('please confirm your wifianywhere  account')
    })
} 
 