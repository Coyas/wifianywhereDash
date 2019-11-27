'use strict'
const User = use('App/Models/User')
const Book = use('App/Models/Booking')
const Pay = use('App/Models/Payment')
const Config = use('App/Models/Config')
class ClienteController {
    async lista({ view }) {
        const config = await Config.find(1)
        const user = await User.query().where('access', '=', 1).fetch()// um usuario de nivel maior que 1 pode ser um cliente?
        const users = user.toJSON()

        const book = await Book.all()
        const books = book.toJSON()

       

       

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
                completo: "00"
            }
        }



        return view.render('cliente.lista', {
            Lugar: 'Lista de Clientes',
            User: Users,
            config: config
        })
    }

    async info({view, params}){
        const config = await Config.find(1)
        const users = await User.find(params.id)
        const user = users.toJSON()

        const books = await Book
            .query()
            .where('user_id', user.id)
            .fetch()
        const book = books.toJSON()
        console.log(book)


        const dados = {
            cliente: user.firstName+' '+user.lastName,
            reservas: book.length,
            recargas: "0",
            firstName: user.firstName,
            lastName: user.lastName,
            city: user.city,
            country: user.country,
            email: user.email,
            avatar: user.avatar,
            username: user.username,
            ativo: user.ativo,
            street_address: user.street_address,
            biling_address: user.biling_address,
            zip_code: user.zip_code,
            phone: user.phone,
            sobreme: user.sobreme
        }

        return view.render('cliente.info', {
            Lugar: `Cliente Username:  ${dados.username}`,
            User: dados,
            config: config
        })
    }
}

module.exports = ClienteController
