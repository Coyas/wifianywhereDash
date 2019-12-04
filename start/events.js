const Event = use('Event')
const Mail = use('Mail')
const Env = use('Env')

Event.on('new::user', async (dados) => {

    console.log('estou dentro de um evento')
    
    await Mail.send('auth.emails.confirm_email', dados, message => {
        message.to(dados.email)
        .from(Env.get('MAIL_USERNAME'))
        .subject('please confirm your wifianywhere  account')
    })

}) 