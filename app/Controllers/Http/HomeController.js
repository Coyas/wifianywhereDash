'use strict'
const User = use('App/Models/User')
const Book = use('App/Models/Booking')
const Plan = use('App/Models/Plan')
const Subs = use('App/Models/Subscribe')
const Faq = use('App/Models/Faq')
const { validate, validateAll } = use('Validator')

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
    
    async faqs({view}){
        return view.render('faqs.index')
    }

    async novofaqs({view}){
        return view.render('faqs.novo')
    }

    async guardarfaqs({request, session, response}){
        const dados = request.all()
        console.log(dados)
        // validar campos de formulario
        const validation = await validateAll(request.all(), {
            title: 'required',
            descricao: 'required'
        }) 


        if(validation.fails()){
            session.withErrors(validation.messages()).flashExcept(['title', 'descricao'])

            return response.redirect('back')
        }


        const faq = new Faq()
        faq.title = dados.title
        faq.descricao = dados.descricao
        faq.lang = dados.lang
        faq.category_id = dados.category
        await faq.save()

        response.redirect('/faqs')

    }

    async updatefaqs({view}){
        return view.render('faqs.update')
    }

    async viewfaqs({view}){
        return view.render('faqs.view')
    }
}
 
module.exports = HomeController
