'use strict'
const User = use('App/Models/User')
const Book = use('App/Models/Booking')
const Plan = use('App/Models/Plan')
const Subs = use('App/Models/Subscribe')
class HomeController {
    async index({ view }) {
        const book = await Book.query().fetch()
        const books = book.toJSON()

        const user = await User.query().fetch()
        const users = user.toJSON()


        const info = {
            users: users.length,
            reservas: books.length
        }

        let reservas = []

        for(let i = 0;i < books.length; i++){
            const plano = await Plan.find(books[i].plano_id)
            const cliente = await User.find(books[i].user_id)

            const aq = books[i].pickupdate
            const rq = books[i].returnday
    
            var local = new Date(aq);
            local.setMinutes( aq.getMinutes() - aq.getTimezoneOffset() )
            const data = local.toJSON().slice(0, 10)
    
            var local2 = new Date(rq);
            local2.setMinutes( rq.getMinutes() - rq.getTimezoneOffset() )
            const data2 = local2.toJSON().slice(0, 10)

            reservas[i] = {
                id: books[i].id,
                plano: plano.nome,
                cliente: cliente.firstName+ ' ' + cliente.lastName,
                pickupDate: data,
                returnDate: data2
            }
        }

        return view.render('home.welcome', {
            Lugar: 'Dashboard',
            info: info,
            Reservas: reservas
        })
    }

    async subscrito({view}){
        const sub = await Subs.all()
        const subs = sub.toJSON()
        let table = []

        for(let i=0;i < subs.length;i++){
            table[i] = {
                index: i,
                id: subs[i].id,
                email: subs[i].email
            }
        }

        console.log(table)
        return view.render('home.subscrito', {
            Lugar: 'Subscritos',
            Table: table     
        })
    }

    async apagasubscrito({params,view, response, auth}){
        if(auth.user.access >= 3) {
            const sub = await Subs.find(params.id)
            await sub.delete()

            response.redirect('back')
        }else {
            return view.render('404')
        }
        
    }
    
    
}
 
module.exports = HomeController
