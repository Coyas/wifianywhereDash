'use strict'
const User = use('App/Models/User')
const Book = use('App/Models/Booking')
class ClienteController {
    async lista({ view }) {
        const user = await User.all()
        const users = user.toJSON()

        const book = await Book.all()
        const books = book.toJSON()

        /**
         * objecto com dados das cards
         */
        const cards = {
            clientes: users.length,
            cper: "3.48",
            reservas: books.length,
            resper: "3.48",
            recargas: "0",
            recper: "5.32",
            performance: "50",
            perper: "12"
        }
        

       

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
            Cards: cards
        })
    }

    info({view}){
        return view.render('cliente.info', {
            Lugar: 'Info de Clientes'
        })
    }
}

module.exports = ClienteController
