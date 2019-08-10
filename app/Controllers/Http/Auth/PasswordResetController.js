'use strict'

const { validate } = use('Validator')
const User = use('App/Models/User')
const PasswordReset = use('App/Models/PasswordReset')
const RandomString = require('random-string')
const Mail = use('Mail')

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

            await Mail.send('auth.passwords.password_reset', mailData, message => {
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

            return response.redirect('/login')
            
        } catch (error) {
            session.flash({
                notification: {
                    type: 'danger',
                    message: 'sorry there is no user with this email address'
                }
            })
        }
    }
}

module.exports = PasswordResetController
