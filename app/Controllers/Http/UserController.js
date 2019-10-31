'use strict'
const User = use('App/Models/User')

class UserController {
    async index({view, params, auth}){

        const user = await User.find(params.id)

        // se nao existe manda para 404

        

        return view.render('user/index', {
            Lugar: 'Perfil',
            paraid: params.id,//id do usuario listado
            User: user
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

        return view.render('user/logs', {
            Lugar: 'Atividades'
        })
    }

    
}

module.exports = UserController
