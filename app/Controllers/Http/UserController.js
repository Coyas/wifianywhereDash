'use strict'
const User = use('App/Models/User')
const { validate, validateAll } = use('Validator')
const Hash = use('Hash')
const Config = use('App/Models/Config')

class UserController {
    async index({view, params, auth}){
        const config = await Config.find(1)
        const user = await User.find(params.id)

        // se nao existe manda para 404

        

        return view.render('user/index', {
            Lugar: 'Perfil',
            paraid: params.id,//id do usuario listado
            User: user,
            config: config
        })
    }

    async editar({view, params, auth, response, request}){
        // console.log(request.all())

        if(auth.user.id != params.id){
            return view.render('404')
        }
        const dados = request.all()

        const user = await User.find(params.id)
        console.log(user)
        user.firstName = dados.firstName
        user.lastName = dados.lastName
        user.email = dados.email
        user.city = dados.city
        user.zip_code = dados.zip_code
        user.street_address = dados.street_address
        user.country = dados.country
        user.biling_address = dados.biling_address
        user.phone = dados.phone
        user.sobreme = dados.sobreme
        const u = await user.save()
        console.log(u)


        response.send('atualizado com sucesso')
    }

    async logs({view, params}){
        const config = await Config.find(1)
        return view.render('user/logs', {
            Lugar: 'Atividades',
            config: config
        })
    }

    async mudarsenha({view, params, auth}){
        if(params.id != auth.user.id) {
            return view.render('404')
        }
        const config = await Config.find(1)
        
        return view.render('user/senha', {
            Lugar: 'Atividades',
            config: config
        })
    }

    async guardarsenha({request, response, session, auth}) {
        const dados = request.all()
        // validar campos de formulario
        const validation = await validateAll(request.all(), {
            old_password: 'required',
            password: 'required|confirmed'
        }) 

        // retrieve user base on the form data
        const user = await User.query()
        .where('email', auth.user.email)
        .where('is_active', true)
        .where('access', '>', 1)// todos com acesso maior q 1 podem entrar no backoffice
        .first()
        
        if(validation.fails()){
            session.withErrors(validation.messages()).flashExcept(['password', 'password_confirmation'])

            return response.redirect('back')
        }

        const passwordVerified = await Hash.verify(dados.old_password, user.password)

        if(passwordVerified){
            const safePassword = await Hash.make(dados.password)

            const atualUser = await User.find(auth.user.id)
            atualUser.password = safePassword

            await atualUser.save()
            
            // response.send(`passwordVerified: ${passwordVerified} /n password: ${safePassword}`)
            response.redirect(`/user/${auth.user.id}`)
        }else {
            response.redirect('back')
        }

    }

    
}

module.exports = UserController
