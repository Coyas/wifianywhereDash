'use strict'
const User = use('App/Models/User')
const Book = use('App/Models/Booking')
const Pay = use('App/Models/Payment')
const Plan = use('App/Models/Plan')
const Place = use('App/Models/Place')
const Device = use('App/Models/Device')
const Momento = require('moment')
const Config = use('App/Models/Config')
const moment = use('moment')
const Sisp = use('App/Services/Sisp')
const Env = use('Env')
const {
  validate,
  validateAll
} = use('Validator')
// const querystring = require('querystring')
const randomString = require('random-string')


class ReservaController {

  async lista({
    view
  }) {
    const config = await Config.first()
    const book = await Book.query().fetch()
    const books = book.toJSON()
    const pay = await Pay
      .query()
      .sum('merchantRespPurchaseAmount as total')

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
      gastos: pay ? pay[0].total : '00',
      gper: "00"
    }

    /**
     * objecto que contem as reservas
     */



    let dadosbook = []
    for (var a = 0; a < books.length; a++) {

      const user = await User.find(books[a].user_id)
      const users = user.toJSON()

      let plan = await Plan.find(books[a].plano_id)
      let plano = plan.toJSON()
      let picklocations = await Place.find(books[a].pickuplocation_id)
      let picklocation = picklocations.toJSON()
      let returnlocations = await Place.find(books[a].returnlocation_id)
      let returnlocation = returnlocations.toJSON()


      const data = Momento(books[a].pickupdate).format('DD-MM-YYYY')
      const data2 = Momento(books[a].returnday).format('DD-MM-YYYY')

      // var local = new Date(aq);
      // local.setMinutes(aq.getMinutes() - aq.getTimezoneOffset())
      // const data = local.toJSON().slice(0, 10)

      // var local2 = new Date(rq);
      // local2.setMinutes(rq.getMinutes() - rq.getTimezoneOffset())
      // const data2 = local2.toJSON().slice(0, 10)

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

  async listar({
    view,
    params
  }) {
    const config = await Config.first()
    const book = await Book
      .query()
      .where('user_id', params.id)
      .fetch()

    if (!book) {
      return view.render('404')
    }


    const books = book.toJSON()

    const pay = await Pay
      .query()
      .sum('merchantRespPurchaseAmount as total')

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
    for (var a = 0; a < books.length; a++) {
      let plan = await Plan.find(books[a].plano_id)
      let plano = plan.toJSON()
      let picklocations = await Place.find(books[a].pickuplocation_id)
      let picklocation = picklocations.toJSON()
      let returnlocations = await Place.find(books[a].returnlocation_id)
      let returnlocation = returnlocations.toJSON()

      const data = Momento(books[a].pickupdate).format('DD-MM-YYYY')
      const data2 = Momento(books[a].returnday).format('DD-MM-YYYY')

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

  async info({
    view,
    params
  }) {
    //pegar as configuracoes do app
    const config = await Config.first()
    //essa pesquisa vai ter que ser mais elaborado pois, vai precisar verificar o estatus do booking e pegar so os finalizados
    const book = await Book.find(params.id)
    //verificar se o booking existe, pois se nao existir vai apresentar error nas outras pesquisas
    if (!book) {
      return view.render('404')
    }

    const Plans = await Plan.all()
    const Planos = Plans.toJSON()

    const books = book.toJSON()

    // console.log(books)

    const plano = await Plan.find(books.plano_id)
    const users = await User.find(books.user_id)
    const picklocation = await Place.find(books.pickuplocation_id)
    const droplocation = await Place.find(books.returnlocation_id)
    const pay = await Pay.findBy('booking_id', books.id)
    const device = await Device.find(books.device_id)
    // console.log(pay)

    const data = Momento(books.pickupdate).format('DD-MM-YYYY')
    const data2 = Momento(books.returnday).format('DD-MM-YYYY')

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
      total: pay ? pay.merchantRespPurchaseAmount : '00',
      qrcode: books.qrcode,
      showup: books.showup,
      devolver: books.devolver,
      device: device ? device.numero : '--',
    }

    return view.render('reserva.info', {
      dados: info,
      config: config,
      Planos
    })
  }

  async pegar({
    response,
    params
  }) {
    console.log(params.id)

    const a = Momento().format('Y-M-D');
    const book = await Book.find(params.id)
    book.showup = a
    await book.save()

    //fazer recaregamento de saldo

    response.redirect(`/reservas/info/${book.id}`)
  }

  async devolver({
    response,
    params,
    request
  }) {
    const dados = request.all()
    console.log(request.all())

    const a = Momento().format('Y-M-D');
    const book = await Book.find(params.id)

    if (book.device_id == dados.device_id) {
      book.devolver = a
      await book.save()
      console.log('device existe')

      //caso houver um azarde força devolver estorno
      const storno = (dados) ? dados.Storno : '0'
      console.log(storno)
      // processar o estorno
      switch (Number(storno)) {
        case 0: // devolver estorno
          console.log('devolver estorno')
          break
        case 1: // cobrar estorno
          console.log('cobrar estorno')
          break
      }
      //recarregar a pagina
      response.redirect('back')
    } else {
      console.log('device nao existe')
    }

  }

  /**
   *
   * Inicio do proceso de reserva
   */
  async novareserva({
    view,
    params
  }) {
    const config = await Config.first()

    const user = await User.find(params.id)

    // console.log('randomString')
    const cripto = randomString({
      length: 40
    })
    // console.log(cripto)

    return view.render('reserva.novo', {
      Lugar: 'Nova Reserva',
      config: config,
      User: user,
      check: cripto
    })
  }
  async guardareserva({
    response,
    params,
    request,
    session
  }) {

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

    if (validation.fails()) {
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

  async chooseplanos({
    view,
    params,
    request
  }) {

    console.log('request check data: ')
    const {
      check
    } = request.get()
    console.log(check)

    const config = await Config.first()

    const user = await User.find(params.id) //id pertence ao user

    if (!user) {
      response.redirect('404')
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
      Cliente: params.id, //id do user
      Local: local,
      check
    })
  }

  async guardarplanos({
    response,
    request,
    params,
    session
  }) {
    // console.log('params id(cliente id): ')
    // console.log(params.id)
    // console.log('queryString do input:')
    // console.log(request.all())
    const {
      check
    } = request.all()

    console.log(request.all())
    // validar campos de formulario
    const validation = await validateAll(request.all(), {
      pickupdate: 'required',
      returnday: 'required',
      plano_id: 'required',
      pickuplocation_id: 'required',
      returnlocation_id: 'required'
    })

    if (validation.fails()) {
      session.withErrors(validation.messages())
      // console.log('create user validation error: ')
      // console.log(validation.messages())
      return response.redirect('back')
    }

    const user = await User.find(params.id)

    if (!user) {
      response.redirect('404')
    }

    //converter a data
    const pick = Momento(request.input('pickupdate')).format('YYYY-MM-DD')
    const drop = Momento(request.input('returnday')).format('YYYY-MM-DD')



    console.log('Criando o booking...')
    const book = new Book()
    book.pickupDate = pick
    book.returnday = drop
    book.flynumber = request.input('flynumber')
    book.check = check ? check : null //atribuir um random numver para validacao
    book.plano_id = request.input('plano_id')
    book.pickuplocation_id = request.input('pickuplocation_id')
    book.returnlocation_id = request.input('returnlocation_id')
    book.user_id = params.id
    book.device_id = '3196' //pagar um device live ou q vai estar livre

    const ok = await book.save()

    if (!ok) {
      response.send('Nao foi possivel criar um book')
    }

    // response.send('book criado com sucesso  ')
    response.redirect(`/reservas/pagareserva/${book.id}?check=${check}&paramsId=${params.id}`) // params.id do booking
  }


  async pagareserva({
    view,
    params,
    request
  }) {
    console.log('request check data: ')
    const {
      check,
      paramsId
    } = request.get()
    // const bookId = params.id
    console.log(check + ' || ' + paramsId)

    const config = await Config.first()

    console.log('params.id:')
    console.log(params.id)
    const book = await Book.find(params.id)
    console.log('book')
    console.log(book)

    if (!book) {
      return view.render('404')
    }

    const plano = await Plan.find(book.plano_id)
    const device = await Device.find(book.device_id)

    // get pagar reserva dados
    const pagaInfo = {
      bookId: params.id,
      cliente: paramsId,
      check,
      pickdate: book.pickdate,
      dropdate: book.dropdate,
      deviceid: book.device_id,
      devicenome: device.nome,
      devicenum: device.numero,
      devicefoto: device.photo,
      megas: plano.megas + 'MB',
      plano: plano.nome,
      preco: amount
    }

    return view.render('reserva.pagar', {
      Lugar: 'Ordem De Reserva',
      config: config, //permite faze o switch de online para offline do frontend
      // bookId,
      // Cliente: paramsId,
      // check,
      PagarData: pagaInfo
    })
  }
  async guardarpagar({
    response,
    request,
    params
  }) {
    console.log(params)
    console.log(request)

    const validation = await validateAll(request.all(), {
      valor: 'required',
      tipo: 'required',
    })

    if (validation.fails()) {
      session.withErrors(validation.messages())
      // console.log('create user validation error: ')
      // console.log(validation.messages())
      return response.redirect('back')
    }

    // fazer o pagamento( adicionar dados na tabela payment)

    //enviar o email de confirmacao de pagamento (usando events)

    response.send('a efetuar pagamento')
  }

  async getRecarregarAmount({
    view,
    params,
    request
  }) {

    return view.render('reserva.pagar')
  }

  async recarregar({
    response,
    request,
    params
  }) {

    const dados = request.all()
    const plan = await Plan.find(dados.plano_id)

    // get config
    const configs = await Config.first()
    // console.log(configs)
    const config = configs.toJSON()



    //criando o formulario de envio para o sisp

    // CONFIGURACOES wifianywhere
    // var posID = "90000063"
    // var posAutCode = "WNLzClRHixeJUAsx"
    // CONFIGURACOES teste
    // var posID = "90051"
    // var posAutCode = "123456789A"

    // OBTER DADOS DE PAGAMENTO
    var amount = (parseInt((Number(plan.preco) * Number(config.txcambio)), 10)).toString()
    console.log(amount)
    // return

    var merchantRef = "R" + moment().format('YYYYMMDDHHmmss')
    var merchantSession = "S" + moment().format('YYYYMMDDHHmmss')
    var dateTime = moment().format('YYYY-MM-DD HH:mm:ss')

    //url de callback  https://mc.vinti4net.cv/VbV_Merchant_Example_v2/merchantResp.jsp
    // var responseUrl = 'https://mc.vinti4net.cv/VbV_Merchant_Example_v2/merchantResp.jsp'
    var responseUrl = `${Env.get('APP_URL')}/reservas/recargaCallback`

    // pegar o numero do device
    const books = await Book.find(params.bookid)
    const book = books.toJSON()
    console.log('book id:')
    console.log(book)
    const DeviceNumeros = await Device.find(book.device_id)
    const DeviceNumero = DeviceNumeros.toJSON()
    console.log('Device numero:')
    console.log(DeviceNumero.numero)

    // return
    //tem que bai Modulo sisp
    var formData = {
      transactionCode: "3", //opcao 3 para recarregamento
      posID: Env.get('posId'),

      merchantRef: merchantRef,
      merchantSession: merchantSession,

      amount: amount,
      currency: "132",

      is3DSec: "1",
      urlMerchantResponse: responseUrl, //tambem conhecido como meu url de callback

      languageMessages: "pt",
      timeStamp: dateTime,

      fingerprintversion: "1",

      entityCode: Env.get('CvmovelEntityCode'), //code para cvmovel (obrigatorio), ver com a sisp
      referenceNumber: DeviceNumero.numero.toString() //numero a ser recarregado (obrigatorio)
    };

    //criando o objecto fingerprint baseado no formData
    formData.fingerprint = Sisp.GerarFingerPrintEnvio(
      Env.get('posAutoCode'), formData.timeStamp, formData.amount,
      formData.merchantRef, formData.merchantSession, formData.posID,
      formData.currency, formData.transactionCode, formData.entityCode, formData.referenceNumber
    )

    console.log('formData out')
    console.log(formData)

    // //gerar o formulario de envio
    const formHtml = Sisp.autoPost(formData)

    console.log('formHtml')
    console.log(formHtml)

    //enviar a requisicao para o sisp
    console.log('formHtml enviando para o sisp')
    response.send(formHtml)
    // response.send(request.all() + ' || ' + formHtml)
  }

  async recargaCallback({
    response,
    request
  }) {
    response.send(request.all())
  }
}

module.exports = ReservaController
