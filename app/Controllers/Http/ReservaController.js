'use strict'
const User = use('App/Models/User')
const Book = use('App/Models/Booking')
const Pay = use('App/Models/Payment')
const Plan = use('App/Models/Plan')
const Place = use('App/Models/Place')
class ReservaController {
    lista({view}){
        return view.render('reserva.lista')
    }

    async listar({view, params}){
        const book = await Book
            .query()
            .where('user_id', params.id)
            .fetch()

        if(!book){
            return view.render('404')
        }


        const books = book.toJSON()
        
        const pay = await Pay
            .query()
            .sum('valor as total')

        // console.log(pay[0].total)
        

        /**
         * objecto com dados das cards
         */
        const cards = {
            reservas: books.length,
            resper: "3.48",
            recargas: "0",
            recper: "5.32",
            performance: "50",
            perper: "12",
            gastos: pay[0].total,
            gper: "00"
        }

        /**
         * objecto que contem as reservas
         */

        const user = await User.find(params.id)
        const users = user.toJSON()

        
        let dadosbook = []
        for(var a=0; a < books.length; a++){
            let plan = await Plan.find(books[a].plano_id)
            let plano = plan.toJSON()
            let picklocations = await Place.find(books[a].pickuplocation_id)
            let picklocation = picklocations.toJSON()
            let returnlocations = await Place.find(books[a].returnlocation_id)
            let returnlocation = returnlocations.toJSON()

            const aq = books[a].pickupdate
            const rq = books[a].returnday

            var local = new Date(aq);
            local.setMinutes( aq.getMinutes() - aq.getTimezoneOffset() )
            const data = local.toJSON().slice(0, 10)

            var local2 = new Date(rq);
            local2.setMinutes( rq.getMinutes() - rq.getTimezoneOffset() )
            const data2 = local2.toJSON().slice(0, 10)
            
                dadosbook[a] = {
                    id: books[a].id,
                    avatar: users.avatar,
                    pickupdate: data,
                    returndate: data2,
                    devolver: books[a].devolver,
                    showup: books[a].showup,
                    plano: plano.nome,
                    pickuplocation: picklocation.nome,
                    returnlocation: returnlocation.nome
                } 
        }

        console.log(dadosbook)

        return view.render('reserva.listar', {
            Lugar: `Reservas de : ${users.username}`,
            User: users,
            Cards: cards,
            Table: dadosbook
        })
    }

    info({view, params}){
        return view.render('reserva.info')
    }
}

module.exports = ReservaController
