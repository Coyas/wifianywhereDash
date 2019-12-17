'use strict'
const User = use('App/Models/User')
const Book = use('App/Models/Booking')
const Pay = use('App/Models/Payment')
const Plan = use('App/Models/Plan')
const Place = use('App/Models/Place')
const Device = use('App/Models/Device')
const Momento = require('moment')
const Config = use('App/Models/Config')
const { validate, validateAll } = use('Validator')
const querystring = require('querystring')
const randomString = require('random-string')


class ReservaController {

    async lista({view}) {
        const config = await Config.find(1)
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
            Cards: cards,
            config: config
        })
    }

    async listar({view, params}) {
        const config = await Config.find(1)
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
            Table: dadosbook,
            config: config
        })
    } 

    async info({view, params}){
        const config = await Config.find(1)
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
            dados: info,
            config: config
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

    async devolver({response, params, request}){
        console.log('request ajax')
        const dados = request.all()
        console.log(request.all())

        const a = Momento().format('Y-M-D');
        const book = await Book.find(params.id)
        if(book.device_id == dados.device_id){
            book.devolver = a
            await book.save()

            response.redirect('back')
        }else{
            console.log('device nao existe')
        }   

    }

    /**
     * 
     * Inicio do proceso de reserva
     */
    async novareserva({view, params}){
        const config = await Config.find(1)

        const user = await User.find(params.id)

        console.log('randomString')
        const cripto = randomString({length: 40})
        console.log(cripto)

        return view.render('reserva.novo', {
            Lugar: 'Nova Reserva',
            config: config,
            User: user,
            check: cripto            
        })
    }
    async guardareserva({response, params, request, session}){

        console.log(request.all())
        // validar campos de formulario
        const validation = await validateAll(request.all(), {
            firstName: 'required',
            lastName: 'required',
            email: 'required',
            street_address: 'required',
            city: 'required',
            country: 'required',
            zip_code: 'required',
            phone: 'required'
        })

        if(validation.fails()){
            session.withErrors(validation.messages())
            console.log('create user validation error: ')
            console.log(validation.messages())
            return response.redirect('back')
        }

        const user = await User.find(params.id)
        user.firstName = request.input('firstName')
        user.lastName = request.input('lastName')
        user.email = request.input('email')
        user.street_address = request.input('street_address')
        user.biling_address = request.input('biling_address')
        user.city = request.input('city')
        user.country = request.input('country')
        user.zip_code = request.input('zip_code')
        user.phone = request.input('phone')
        user.sobreme = request.input('sobreme')

        await user.save()

        // nao funciona se nao ha nada paa atualizar
        // if(u){
        //     // response.send('guardar nova reserva')
            response.redirect(`/reservas/chooseplano/${params.id}?check=${request.input('check')}`)
        // }else{
        //     //implementa u metodo de alert
        //     response.redirect('back')
        // }
    }

    async chooseplanos({view, params, request}) {
        
        console.log('request check data: ')
        const { check } = request.get()
        console.log(check)

        const config = await Config.find(1)

        const user = await User.find(params.id)

        if(!user){
            response.send('Usuario nao existe')
        }

        // dados
        // lista de planos
        const planos = await Plan.all()
        const plano = planos.toJSON()
        console.log(plano)
        // pick up location list
        const locals = await Place.all()
        const local = locals.toJSON()
        // return location list

        return view.render('reserva.chooseplanos', {
            Lugar: 'Ordem De Reserva',
            config: config,
            Plano: plano,
            Cliente: params.id,
            Local: local,
            check
        })
    }

    async guardarplanos({response, request, params, session}){
        console.log('params id(cliente id): ')
        console.log(params.id)
        console.log('queryString do input:')
        console.log(request.all())
        const { check } = request.all()

        console.log(request.all())
        // validar campos de formulario
        const validation = await validateAll(request.all(), {
            pickupdate: 'required',
            returnday: 'required',
            plano_id: 'required',
            pickuplocation_id: 'required',
            returnlocation_id: 'required'
        })

        if(validation.fails()){
            session.withErrors(validation.messages())
            // console.log('create user validation error: ')
            // console.log(validation.messages())
            return response.redirect('back')
        }

        const user = await User.find(params.id)

        if(!user){
            response.send('Usuario nao existe')
        }



        console.log('Criando o booking...')
        const book = new Book()
        book.pickupDate = request.input('pickupdate')
        book.returnday  = request.input('returnday')
        book.flynumber  = request.input('flynumber')
        book.check      = null //atribuir um random numver para validacao
        book.plano_id   = request.input('plano_id')
        book.pickuplocation_id = request.input('pickuplocation_id')
        book.returnlocation_id = request.input('returnlocation_id')
        book.user_id    = params.id
        book.device_id  = 2//pagar um device live ou q vai estar livre

        const ok = await book.save()

        if(!ok){
            response.send('Nao foi possivel criar um book')
        }

        // response.send('book criado com sucesso  ')
        response.redirect(`/reservas/pagareserva/${book.id}?check=${check}`)// id do booking
    }

    
    async pagareserva({view, params, request}){
        console.log('request check data: ')
        const { check } = request.get()
        const bookId = params.id 
        console.log(check)

        const config = await Config.find(1)

        const book = await Book.find(params.id)

        if(!book){
            return view.render('404')
        }

        // get pagar reserva dados

        return view.render('reserva.pagar', {
            Lugar: 'Ordem De Reserva',
            config: config,
            bookId,
            check
        })
    }
    // guardarpagar({}){}
}
  
module.exports = ReservaController
