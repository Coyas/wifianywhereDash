'use strict'
const User = use('App/Models/User')
const Book = use('App/Models/Booking')
const Pay = use('App/Models/Payment')
const Plan = use('App/Models/Plan')
const Place = use('App/Models/Place')
const Device = use('App/Models/Device')
const Momento = require('moment')
class ReservaController {

    async lista({view}) {
        const book = await Book.query().fetch()
        const books = book.toJSON()
        const pay = await Pay
        .query()
        .sum('valor as total')

        /**
         * objecto com dados das cards
         */
        const cards = {
            reservas: books.length,
            resper: "0.00",
            recargas: "0",
            recper: "0.00",
            performance: "00",
            perper: "00",
            gastos: pay[0].total,
            gper: "00"
        }

        /**
         * objecto que contem as reservas
         */


        
        let dadosbook = []
        for(var a=0; a < books.length; a++){

            const user = await User.find(books[a].user_id)
            const users = user.toJSON()

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
                nome: users.firstName + ' ' + users.lastName,
                pickupdate: data,
                returndate: data2,
                devolver: books[a].devolver,
                showup: books[a].showup,
                plano: plano.nome,
                pickuplocation: picklocation.nome,
                returnlocation: returnlocation.nome,
                userID: books[a].user_id
            } 
        }

        // console.log(dadosbook)

        return view.render('reserva.lista', {
            Table: dadosbook,
            Cards: cards
        })
    }

    async listar({view, params}) {
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
                    returnlocation: returnlocation.nome,
                    userID: books[a].user_id
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

    async info({view, params}){
        const book = await Book.find(params.id)
        const books = book.toJSON()

        // console.log(books)

        const plano = await Plan.find(books.plano_id)
        const users = await User.find(books.user_id)
        const picklocation = await Place.find(books.pickuplocation_id)
        const droplocation = await Place.find(books.returnlocation_id)
        const pay = await Pay.findBy('booking_id', books.id)
        const device = await Device.find(books.device_id)
        // console.log(pay)

        const aq = books.pickupdate
        const rq = books.returnday

        var local = new Date(aq);
        local.setMinutes( aq.getMinutes() - aq.getTimezoneOffset() )
        const data = local.toJSON().slice(0, 10)

        var local2 = new Date(rq);
        local2.setMinutes( rq.getMinutes() - rq.getTimezoneOffset() )
        const data2 = local2.toJSON().slice(0, 10)

        const info = {
            id: books.id,
            nome: users.firstName + ' ' + users.lastName,
            pickupDate: data,
            returnDate: data2,
            Plano: plano.nome,
            megas: plano.megas,
            phone: users.phone,
            picklocation: picklocation.nome,
            droplocation: droplocation.nome,
            total: pay.valor,
            qrcode: books.qrcode,
            showup: books.showup,
            devolver: books.devolver,
            device: device.numero
        }

        return view.render('reserva.info', {
            dados: info
        })
    }

    async pegar({response, params}){
        console.log(params.id)

        const a = Momento().format('Y-M-D');
        const book = await Book.find(params.id)
        book.showup = a
        await book.save()

        response.redirect(`/reservas/info/${book.id}`)
    }

    async devolver({response, params}){
        console.log(params.id)

        const a = Momento().format('Y-M-D');
        const book = await Book.find(params.id)
        book.devolver = a
        await book.save()

        response.redirect(`/reservas/info/${book.id}`)
    }
}
 
module.exports = ReservaController
