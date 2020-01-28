'use strict'
const User = use('App/Models/User')
const Book = use('App/Models/Booking')
const Plan = use('App/Models/Plan')
const Subs = use('App/Models/Subscribe')
const Faq = use('App/Models/Faq')
const Cat = use('App/Models/Category')
const Config = use('App/Models/Config')
const Device = use('App/Models/Device')
const {
  validate,
  validateAll
} = use('Validator')
const moment = use('moment')

class HomeController {
  async index({
    view
  }) {
    const config = await Config.first()
    const book = await Book.query().fetch()
    const books = book.toJSON()

    const user = await User.query().fetch()
    const users = user.toJSON()

    const info = {
      users: users.length,
      reservas: books.length
    }

    let reservas = []

    for (let i = 0; i < books.length; i++) {
      const plano = await Plan.find(books[i].plano_id)
      const cliente = await User.find(books[i].user_id)

      const data = moment(books[i].pickupdate).format('DD-MM-YYYY')
      const data2 = moment(books[i].returnday).format('DD-MM-YYYY')

      reservas[i] = {
        id: books[i].id,
        plano: plano.nome,
        cliente: cliente.firstName + ' ' + cliente.lastName,
        pickupDate: data,
        returnDate: data2
      }
    }

    console.log(config)
    return view.render('home.welcome', {
      Lugar: 'Dashboard',
      info: info,
      Reservas: reservas,
      config: config
    })
  }

  async subscrito({
    view
  }) {
    const config = await Config.first()

    const sub = await Subs.all()
    const subs = sub.toJSON()
    let table = []

    for (let i = 0; i < subs.length; i++) {
      table[i] = {
        index: i,
        id: subs[i].id,
        email: subs[i].email
      }
    }

    console.log(table)
    return view.render('home.subscrito', {
      Lugar: 'Subscritos',
      Table: table,
      config: config
    })
  }

  async apagasubscrito({
    params,
    view,
    response,
    auth
  }) {
    if (auth.user.access >= 3) {
      const sub = await Subs.find(params.id)
      await sub.delete()

      response.redirect('back')
    } else {
      return view.render('404')
    }

  }

  async faqs({
    view,
    auth
  }) {

    const config = await Config.first()
    const faq = await Faq.all()
    const faqs = faq.toJSON()
    let table = []
    for (let i = 0; i < faqs.length; i++) {
      let str = faqs[i].descricao
      let res = str.substring(0, 20)

      const catego = await Cat.find(faqs[i].category_id)

      table[i] = {
        index: i,
        id: faqs[i].id,
        title: faqs[i].title,
        category: catego.nome,
        lang: faqs[i].lang,
        descricao: res + '...'
      }
    }
    // console.log(table)
    // die
    return view.render('faqs.index', {
      Table: table,
      config: config
    })
  }

  async novofaqs({
    view
  }) {
    const config = await Config.first()

    return view.render('faqs.novo', {
      config,
      config
    })
  }

  async guardarfaqs({
    request,
    session,
    response,
    auth
  }) {
    if (auth.user.access < 3) {
      return view.render('404')
    }

    const dados = request.all()
    console.log(dados)
    // validar campos de formulario
    const validation = await validateAll(request.all(), {
      title: 'required',
      descricao: 'required'
    })


    if (validation.fails()) {
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

  async updatefaqs({
    view,
    auth,
    params
  }) {
    const config = await Config.first()
    if (auth.user.access < 3) {
      return view.render('404')
    }

    const faq = await Faq.find(params.id)
    const faqs = faq.toJSON()
    console.log(faqs)

    return view.render('faqs.update', {
      dados: faqs,
      config: config
    })
  }
  async updatefaq({
    response,
    request,
    params,
    session,
    auth
  }) {
    if (auth.user.access < 3) {
      return view.render('404')
    }
    const dados = request.all()
    console.log('update faq')
    // validar campos de formulario
    const validation = await validateAll(request.all(), {
      title: 'required',
      descricao: 'required'
    })

    console.log('update faq validation')
    if (validation.fails()) {
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

  async viewfaqs({
    view,
    params
  }) {
    const config = await Config.first()
    console.log('params.id: ' + params.id)
    console.log(typeof (params.id))
    console.log('Number: ')
    console.log(typeof (Number()))
    console.log(typeof (params.id) === typeof (Number()))
    if (typeof (params.id) == typeof (String())) { //tem de ficar integer

      const faq = await Faq.find(params.id)
      const faqs = faq.toJSON()
      // console.log(faqs.nome)
      return view.render('faqs.view', {
        Data: faqs,
        config: config
      })
    } else {
      return view.render('404')
    }


  }

  async apagarfaqs({
    params,
    auth,
    response
  }) {
    if (auth.user.access < 3) {
      return view.render('404')
    }

    const faq = await Faq.find(params.id)
    await faq.delete()

    response.redirect('/faqs')
  }

  async getcategoria({
    request,
    response
  }) {
    const dados = request.all()
    console.log(dados.lang)

    const catego = await Cat.query().where('lang', dados.lang).fetch()
    // console.log(catego)
    // const cat = catego.toJSON()
    if (catego) {
      // let data = []
      // for(let i = 0; i < cat.length;i++){
      //     data[i]
      // }
      response.json(catego)
    } else {
      const data2 = {

      }
      response.json(data2)
    }

  }

  /**
   *
   * pegar dados sobre planos e devices
   */
  async getdados({
    response,
    request
  }) {
    const dados = request.all()
    console.log(`dados:`)
    console.log(dados)

    if (!dados) {
      response.json({
        'plano': 'sem dados'
      })
    }
    const plano = await Plan.find(dados.plano)

    //get device livre ou que possam estar livres
    const device = await Device.find(2)

    if (plano && device) { //1 - 1
      var obj = {
        caso: 1,
        plano: plano.nome,
        megas: plano.megas,
        preco: plano.preco,
        deviceid: device.id,
        devicenome: device.nome,
        devicenum: device.numero,
        devicefoto: '/assets/img/brand/blue.png'
      }
    } else if (plano && !device) { //1 - 0
      var obj = {
        caso: 2,
        plano: plano.nome,
        megas: plano.megas,
        preco: plano.preco,
        device: "Sem Despositivos Livres"
      }
    } else if (!plano && device) { //0 - 1
      var obj = {
        caso: 3,
        plano: "Não existem planos disponíveis",
        deviceid: device.id,
        devicenome: device.nome,
        devicenum: device.numero,
        devicefoto: '/assets/img/brand/blue.png'
      }
    } else { // 0 - 0
      var obj = {
        caso: 4,
        plano: "Não existem planos disponíveis",
        device: "Sem Despositivos Livres"
      }
    }



    response.json(obj)
  }

  async siteconfig({
    request,
    response
  }) {
    const dados = request.all()
    console.log(dados)

    const config = await Config.first()
    config.online = dados.status
    const a = await config.save()

    response.json(a)
  }
}

module.exports = HomeController
