'use strict'
const User = use('App/Models/User')

class UsuarioController {
    async index({view}){
        const user = await User.query().where('access', '>', 1).fetch()
        const users = user.toJSON()
        /**
         * objeto para listar clientes
         */
        let Users = []
        let username =""
        for(let i=0;i < users.length; i++){
            if(users[i].firstName == null || users[i].lastName == null){
                username = users[i].username
            }else{
                username = users[i].firstName +" "+ users[i].lastName 
            }

            Users[i] = {
                id: users[i].id,
                avatar: users[i].avatar,
                nome: username,
                estado: users[i].is_active == 1 ? '<i class="bg-success"></i> ativo' : '<i class="bg-danger"></i> inativo',
                reservas: "00",
                recargas: "00",
                completo: "00",
                active: users[i].is_active
            }
        }
        return view.render('user/usuarios', {
            Lugar: 'Usuarios',
            User: Users
        })
    }

    async isactive({params, auth, view, response}){//if is active desativar
        if(params.id == auth.user.id){//nao permite um utilizador desativar a sua propria conta
            return view.render(404)
        }
        const user = await User.find(params.id)

        user.is_active = 0
        await user.save()

        response.redirect('back')
    }

    async isdesativo({params, auth, view, response}){
        if(params.id == auth.user.id){//nao permite um utilizador desativar a sua propria conta
            return view.render(404)
        }
        console.log('user find')
        const user = await User.find(params.id)

        user.is_active = 1
        console.log('user ativado')
        const a = await user.save()
        console.log('user find: '+a)
        
        response.redirect('back')
    }
}

module.exports = UsuarioController
