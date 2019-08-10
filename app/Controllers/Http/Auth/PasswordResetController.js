'use strict'

const { validate, validateAll } = use('Validator')
const User = use('App/Models/User')
const PasswordReset = use('App/Models/PasswordReset')
const RandomString = require('random-string')
const Mail = use('Mail')
const Hash = use('Hash')

class PasswordResetController {

    showLinkRequestForm ({ view }){
        return view.render('auth.passwords.email')
    }

    async sendResetLinkEmail({ request, session, response}){
        // validate form input
        const validation = await validate(request.only('email'), {
            email: 'required|email'
        })

        if(validation.fails()){
            session.withErrors(validation.messages()).flashAll()

            return response.redirect('back')
        }

        try {
            // get the user
            const user = await User.findBy('email', request.input('email'))

            await PasswordReset.query().where('email', user.email).delete()

            const { token } = await PasswordReset.create({
                email: user.email,
                token: RandomString({ length: 40})
            })

            const mailData = {
                user: user.toJSON(),
                token
            }

            await Mail.send('auth.emails.password_reset', mailData, message => {
                message.to(user.email)
                .from('hello@edad.qsd')
                .subject('password reset link')
            })

            session.flash({
                notification: {
                    type: 'success',
                    message: 'A password reset link as been sent to your email address'
                }
            })

            return response.redirect('/auth/login')
            
        } catch (error) {
            session.flash({
                notification: {
                    type: 'danger',
                    message: 'sorry there is no user with this email address'
                }
            })
        } 
    }

    showResetForm({ params, view }){
        return view.render('auth.passwords.reset', {token: params.token})
    }

    async reset ({ request, session, response}){

        // validar campos de formulario
        const validation = await validateAll(request.all(), {
            token: 'required',
            email: 'required',
            password: 'required|confirmed'
        })
        
        if(validation.fails()){
            session.withErrors(validation.messages()).flashExcept(['password', 'password_confirmation'])

            return response.redirect('back')
        }

        try {
            // get user by the provided email
            const user = await User.findBy('email', request.input('email'))
            console.log(user)

            // check if password reset token exist for user
            const token = await PasswordReset.query()
            .where('email', user.email)
            .where('token', request.input('token'))
            .first()

            if(!token) {
                session.flash({
                    notification: {
                        type: 'danger',
                        message: 'This password reset token does not exist'
                    }
                })

                return response.redirect('back')
            }

            console.log('Password: ')
            console.log(request.input('password'))
            user.password = await Hash.make(request.input('password'))
            console.log('hash: ')
            console.log(user.password)
            await user.save()
            
            // delete password reset token
            await PasswordReset.query().where('email', user.email).delete()

            session.flash({
                notification: {
                    type: 'success',
                    message: 'your password has been reset'
                }
            })

            return response.redirect('/auth/login')

        } catch (error) {
            session.flash({
                notification: {
                    type: 'danger',
                    message: 'Sorry, there is no user with this email address'
                }
            })

            return response.redirect('back')
        }
    }
}

module.exports = PasswordResetController