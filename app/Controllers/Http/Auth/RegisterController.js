'use strict'

// imports
const { validateAll } = use('Validator')
const User = use('App/Models/User')
const randomString = require('random-string')
const Mail = use('Mail')

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
            password: 'required'
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
        // console.log(request.input('password'))

        const user = await User.create({
            username: request.input('username'),
            email: request.input('email'),
            password: request.input('password'),
            confirmation_token: randomString({length: 40})
        })

        //send confirmation email
        console.log('sending email...')
        await Mail.send('auth.emails.confirm_email', user.toJSON(), message => {
            message.to(user.email)
            .from('hello@terra.com')
            .subject('Please confirm your email address')
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
                message: 'Seu email foi confimao com sucesso'
            }
        })

        return response.redirect('/auth/login')
    }
}

module.exports = RegisterController
