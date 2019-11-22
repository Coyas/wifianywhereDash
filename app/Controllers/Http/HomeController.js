'use strict'
const User = use('App/Models/User')
const Book = use('App/Models/Booking')
const Plan = use('App/Models/Plan')
const Subs = use('App/Models/Subscribe')
const Faq = use('App/Models/Faq')
const Cat = use('App/Models/Category')
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
    
    async faqs({view, auth}){
        

        const faq = await Faq.all()
        const faqs = faq.toJSON()
        let table = []
        for(let i =0;i<faqs.length;i++){
            let str = faqs[i].descricao
            let res = str.substring(0, 20)

            const catego = await Cat.find(faqs[i].category_id)

            table[i] = {
                index: i,
                id: faqs[i].id,
                title: faqs[i].title,
                category: catego.nome,
                lang: faqs[i].lang,
                descricao: res+'...'
            }
        }
        // console.log(table)
        // die
        return view.render('faqs.index', {
            Table: table
        })
    }

    async novofaqs({view}){
        return view.render('faqs.novo')
    }

    async guardarfaqs({request, session, response, auth}){
        if(auth.user.access < 3){
            return view.render('404')
        }

        const dados = request.all()
        console.log(dados)
        // validar campos de formulario
        const validation = await validateAll(request.all(), {
            title: 'required',
            descricao: 'required'
        }) 


        if(validation.fails()){
            session.withErrors(validation.messages())

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

    async updatefaqs({view, auth, params}){
        if(auth.user.access < 3){
            return view.render('404')
        }

        const faq = await Faq.find(params.id)
        const faqs = faq.toJSON()
        console.log(faqs)

        return view.render('faqs.update', {
            dados: faqs
        })
    }
    async updatefaq({response, request, params, session}){
        const dados = request.all()
        console.log('update faq')
        // validar campos de formulario
        const validation = await validateAll(request.all(), {
            title: 'required',
            descricao: 'required'
        }) 

        console.log('update faq validation')
        if(validation.fails()){
            session.withErrors(validation.messages())
            console.log('update faq validation error')
            return response.redirect('back')
        }

        console.log('find faq')
        const faq = await Faq.find(params.id)
        faq.title = dados.title
        faq.descricao = dados.descricao
        await faq.save()

        response.redirect(`/faqs/view/${params.id}`)
    }

    async viewfaqs({view, params}){
        console.log('params.id: '+params.id)
        console.log(typeof(params.id))
        console.log('Number: ')
        console.log(typeof(Number()))
        console.log(typeof(params.id) === typeof(Number()))
        if( typeof(params.id) == typeof(String()) ){//tem de ficar integer

            const faq = await Faq.find(params.id)
            const faqs = faq.toJSON()
            // console.log(faqs.nome)
            return view.render('faqs.view', {
                Data: faqs
            })
        }else {
            return view.render('404')
        }


    }
}
 
module.exports = HomeController
