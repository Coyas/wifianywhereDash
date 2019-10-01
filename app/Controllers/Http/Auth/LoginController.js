'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')


class LoginController {
    showformlogin({ view }){
        return view.render('auth.login')
    }

    async login({ request, auth, session, response }){
        // get form data
        const { email, password, remember} = request.all()

        // retrieve user base on the form data
        const user = await User.query()
        .where('email', email)
        .where('is_active', true)
        .where('access', '>', 1)// todos com acesso maior q 1 podem entrar no backoffice
        .first()

        console.log(user)

        // verify password
        if(user){
            console.log('verificar password: ')
            const passwordVerified = await Hash.verify(password, user.password)
            console.log(passwordVerified)
            if(passwordVerified){
                // login user
                await auth.remember(!!remember).login(user)

                return response.route('/')
            }
        }

        // display error message
        session.flash({
            notification: {
                type: 'danger',
                message: `Nao conseguimos verificar seus credenciais. tenha certeza de que ja confirmou seu email.`
            }
        })

        return response.redirect('back')
        
    }
}

module.exports = LoginController
