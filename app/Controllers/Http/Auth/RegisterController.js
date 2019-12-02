'use strict'

// imports
const { validateAll } = use('Validator')
const User = use('App/Models/User')
const randomString = require('random-string')
const Mail = use('Mail')
const Env = use('Env')

class RegisterController {
    async showform({ view }){
        // const a = await User.all()
        // console.log(a.toJSON())
        return view.render('auth.register')
    }

    async register({request, session, response}){
        console.log('Validating users forms...')
        // validate form 
        const validation = await validateAll(request.all(), {
            username: 'required|unique:users,username',
            email: 'required|email|unique:users,email',
            firstName: 'required',
            lastName: 'required',
            access: 'required'
        })

        if(validation.fails()){ 
            session.withErrors(validation.messages()).flashExcept(['password'])

            return response.redirect('back')
        }
        // create user
        console.log('creating user...')
        // console.log('username:')
        // console.log(request.input('username'))
        // console.log('email:')
        // console.log(request.input('email'))
        // console.log('password:')
        console.log(request.input('access'))

        const password = randomString({length: 10})

        const user = await User.create({
            username: request.input('username'),
            firstName: request.input('firstName'),
            firstName: request.input('lastName'),
            email: request.input('email'),
            access: request.input('access'),
            password: password,
            confirmation_token: randomString({length: 40})
        })
        const swap = user.toJSON()
        const dados = {
            email: swap.email,
            username: swap.username,
            pass: password,
            confirmation_token: swap.confirmation_token
        }

        //send confirmation email
        console.log('sending email...')
        await Mail.send('auth.emails.confirm_email', dados, message => {
            message.to(dados.email)
            .from(Env.get('MAIL_USERNAME'))
            .subject('please confirm your wifianywhere  account')
        })

        //display success message
        console.log('flashing messages...')
        session.flash({
            notification:{
                type: 'success',
                message: 'Registrado com sucesso! Verifique o seu email para ativar sua conta'
            }
        })

        return response.redirect('/auth/login')

    }

    async confirmEmail({ params, session, response }){
        // get user with the confirmation token
        const user = await User.findBy('confirmation_token', params.token)

        // set confirmation to null and is_active to true
        user.confirmation_token = null
        user.is_active = true

        // persist user to database
        await user.save()

        // display success massage
        session.flash({
            notification: {
                type: 'success',
                message: 'Seu email foi confirmado com sucesso'
            }
        })

        return response.redirect('/auth/login')
    }
}

module.exports = RegisterController
