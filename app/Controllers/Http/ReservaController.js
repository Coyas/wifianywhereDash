// 'use strict';
/* global use */

const User = use('App/Models/User');
const Book = use('App/Models/Booking');
const Pay = use('App/Models/Payment');
const Plan = use('App/Models/Plan');
const Place = use('App/Models/Place');
const Device = use('App/Models/Device');
const Momento = use('moment');
const Config = use('App/Models/Config');
const Sisp = use('App/Services/Sisp');
const Env = use('Env');
const { validateAll } = use('Validator');
const Utils = use('App/Services/Utils');
const reservaDevice = use('App/Services/reservaDevice');
const Hash = use('Hash');
const Cloudinary = use('App/Services/Cloudinary');
const Event = use('Event');
// const querystring = require('querystring')
// const randomString = require('random-string');

class ReservaController {
  async lista({ view }) {
    const config = await Config.first();
    const book = await Book.query().fetch();
    const books = book.toJSON();
    const pay = await Pay.query().sum('merchantRespPurchaseAmount as total');

    /**
     * objecto com dados das cards
     */
    const cards = {
      reservas: books.length,
      resper: '0.00',
      recargas: '0',
      recper: '0.00',
      performance: '00',
      perper: '00',
      gastos: pay ? pay[0].total : '00',
      gper: '00',
    };

    /**
     * objecto que contem as reservas
     */

    let dadosbook = [];
    for (var a = 0; a < books.length; a++) {
      const user = await User.find(books[a].user_id);
      const users = user.toJSON();

      let plan = await Plan.find(books[a].plano_id);
      let plano = plan.toJSON();
      let picklocations = await Place.find(books[a].pickuplocation_id);
      let picklocation = picklocations.toJSON();
      let returnlocations = await Place.find(books[a].returnlocation_id);
      let returnlocation = returnlocations.toJSON();

      const data = Momento(books[a].pickupdate).format('DD-MM-YYYY');
      const data2 = Momento(books[a].returnday).format('DD-MM-YYYY');

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
        userID: books[a].user_id,
      };
    }

    // console.log(dadosbook)

    return view.render('reserva.lista', {
      Table: dadosbook,
      Cards: cards,
      config,
    });
  }

  async listar({ view, params }) {
    const { id } = params;

    const config = await Config.first();
    const book = await Book.query()
      .where('user_id', id)
      .fetch();

    if (!id || id === 'undefined') {
      return view.render('404');
    }

    if (!book) {
      return view.render('404');
    }

    const books = book.toJSON();

    const pay = await Pay.query().sum('merchantRespPurchaseAmount as total');

    // console.log(pay[0].total)

    /**
     * objecto com dados das cards
     */
    const cards = {
      reservas: books.length,
      resper: '3.48',
      recargas: '0',
      recper: '5.32',
      performance: '50',
      perper: '12',
      gastos: pay[0].total,
      gper: '00',
    };

    /**
     * objecto que contem as reservas
     */

    const user = await User.find(id);
    const users = user.toJSON();

    let dadosbook = [];
    for (var a = 0; a < books.length; a++) {
      let plan = await Plan.find(books[a].plano_id);
      let plano = plan.toJSON();
      let picklocations = await Place.find(books[a].pickuplocation_id);
      let picklocation = picklocations.toJSON();
      let returnlocations = await Place.find(books[a].returnlocation_id);
      let returnlocation = returnlocations.toJSON();

      const data = Momento(books[a].pickupdate).format('DD-MM-YYYY');
      const data2 = Momento(books[a].returnday).format('DD-MM-YYYY');

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
        userID: books[a].user_id,
      };
    }

    console.log(dadosbook);

    return view.render('reserva.listar', {
      Lugar: `Reservas de : ${users.username}`,
      User: users,
      Cards: cards,
      Table: dadosbook,
      config,
    });
  }

  async info({ view, params }) {
    // pegar as configuracoes do app
    const config = await Config.first();
    /* essa pesquisa vai ter que ser mais elaborado pois, vai precisar verificar o
     * estatus do booking e pegar so os finalizados
     */
    const book = await Book.find(params.id);
    // verificar se o booking existe, pois se nao existir vai apresentar error nas outras pesquisas
    if (!book) {
      return view.render('404');
    }

    const Plans = await Plan.all();
    const Planos = Plans.toJSON();

    const books = book.toJSON();

    // console.log(books)

    const plano = await Plan.find(books.plano_id);
    const users = await User.find(books.user_id);
    const picklocation = await Place.find(books.pickuplocation_id);
    const droplocation = await Place.find(books.returnlocation_id);
    const pay = await Pay.findBy('booking_id', books.id);
    const device = await Device.find(books.device_id);
    // console.log(pay)

    const data = Momento(books.pickupdate).format('DD-MM-YYYY');
    const data2 = Momento(books.returnday).format('DD-MM-YYYY');

    /**
     * pegar a deferenca dos dias
     */
    const x = new Momento(books.pickupdate);
    const y = new Momento(books.returnday);

    // var duration = Momento.duration(x.diff(y, 'days'))
    const dias = y.diff(x, 'days');

    const info = {
      id: books.id,
      nome: `${users.firstName} ${users.lastName}`,
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
      tipo: !!(pay.tipo == '10' || pay.tipo == '11'),
      payId: pay ? pay.id : '',
      dias,
    };

    return view.render('reserva.info', {
      dados: info,
      config,
      Planos,
    });
  }

  async pegar({ response, params }) {
    const a = Momento().format('Y-M-D');
    const book = await Book.find(params.id);
    book.showup = a;
    await book.save();

    return Sisp.recarregar(book, response);
  }

  async devolver({ response, params, request }) {
    const dados = request.all();
    console.log(request.all());

    const a = Momento().format('Y-M-D');
    const book = await Book.find(params.id);

    if (book.device_id !== dados.device_id) {
      // recarregar a pagina
      console.log('device...nao...existe');
      return response.redirect('back');
    }

    book.devolver = a;

    await book.save();
    console.log('device existe');

    // caso houver um azarde força devolver estorno
    const storno = dados ? dados.Storno : '0';
    console.log(storno);
    // processar o estorno
    switch (Number(storno)) {
      case 0: // devolver estorno
        console.log('devolver estorno');
        break;
      case 1: // cobrar estorno
        console.log('cobrar estorno');
        break;
      default:
        console.log('aconteceu algum erro');
    }
  }

  /**
   *
   * Inicio do proceso de reserva
   */
  async novareserva({ view, params, request }) {
    const config = await Config.first();
    const { check } = request.get();

    if (!params.id) {
      return view.render('404');
    }

    // verificar se ha reserva
    const books = await Book.findBy('check', check);
    let book = null;
    let { id } = params;

    if (books) {
      book = books.toJSON();
      id = book.user_id;
    }
    const user = await User.find(id);

    // if (books) {
    //   // pega os dados do user

    // }

    const UserData = {
      id: user ? user.id : '',
      firstName: user ? user.firstName : '',
      lastName: user ? user.lastName : '',
      phone: user ? user.phone : '',
      email: user ? user.email : '',
      street_address: user ? user.street_address : '',
      biling_address: user ? user.biling_address : '',
      city: user ? user.city : '',
      zip_code: user ? user.zip_code : '',
      sobreme: user ? user.sobreme : '',
      country: user ? user.country : '',
    };

    return view.render('reserva.novo', {
      Lugar: 'Nova Reserva',
      config,
      User: UserData,
      check,
    });
  }

  async guardareserva({ response, params, request, session }) {
    // console.log(request.all());
    // validar campos de formulario

    if (!params.id || params.id === 'undefined') {
      return response.redirect('/404');
    }

    const validation = await validateAll(request.all(), {
      firstName: 'required',
      lastName: 'required',
      email: 'required',
      street_address: 'required',
      city: 'required',
      country: 'required',
      // zip_code: 'required',
      phone: 'required',
      check: 'required',
    });

    if (validation.fails()) {
      session.withErrors(validation.messages());
      // console.log("create user validation error: ");
      // console.log(validation.messages());
      return response.redirect('back');
    }

    const user = await User.find(params.id);
    user.firstName = request.input('firstName');
    user.lastName = request.input('lastName');
    user.email = request.input('email');
    user.street_address = request.input('street_address');
    user.biling_address = request.input('biling_address');
    user.city = request.input('city');
    user.country = request.input('country');
    user.zip_code = request.input('zip_code');
    user.phone = request.input('phone');
    user.sobreme = request.input('sobreme');

    await user.save();

    // nao funciona se nao ha nada paa atualizar
    // if(u){
    //     // response.send('guardar nova reserva')
    return response.redirect(
      `/reservas/chooseplano/${params.id}?check=${request.input('check')}`
    );
    // }else{
    //     //implementa u metodo de alert
    //     response.redirect('back')
    // }
  }

  async chooseplanos({ view, params, request, auth }) {
    const { check } = request.get();
    let { id } = params;

    const ok = await Utils.verificarCheck(check, auth);
    if (!ok) {
      return view.render('404');
    }
    if (!id || id === 'undefined') {
      return view.render('404');
    }

    const config = await Config.first();

    const user = await User.find(params.id); // id pertence ao user

    if (!user) {
      // console.log('user not found');
      return view.render('404');
    }

    const books = await Book.findBy('check', check);
    let book = null;

    if (books) {
      book = books.toJSON();
      id = book.user_id;
    }

    const pickupdate = book
      ? Momento(book.pickupdate).format('DD/MM/YYYY')
      : '';
    const returnday = book ? Momento(book.returnday).format('DD/MM/YYYY') : '';

    const bookData = {
      pickupdate: pickupdate,
      returnday: returnday,
      flynumber: book ? book.flynumber : '',
      powerbank: book ? book.powerbank : '',
      picklocation: book ? book.pickuplocation_id : '',
      droplocation: book ? book.returnlocation_id : '',
      planoId: book ? book.plano_id : '',
      check,
    };

    // dados
    // lista de planos
    const planos = await Plan.all();
    const plano = planos.toJSON();
    // console.log(plano);
    // pick up location list
    const locals = await Place.all();
    const local = locals.toJSON();
    // return location list

    return view.render('reserva.chooseplanos', {
      Lugar: 'Ordem De Reserva',
      config,
      Plano: plano,
      ClienteId: id, // id do user
      bookData,
      Local: local,
      check,
    });
  }

  async guardarplanos({ response, request, params, session, auth }) {
    const { check } = request.all();
    const { id } = params;

    const ok = await Utils.verificarCheck(check, auth);
    if (!ok && !id && !check) {
      return response.redirect('/404');
    }

    // validar campos de formulario
    const validation = await validateAll(request.all(), {
      pickupdate: 'required',
      returnday: 'required',
      plano_id: 'required',
      pickuplocation_id: 'required',
      returnlocation_id: 'required',
    });

    if (validation.fails()) {
      session.withErrors(validation.messages());
      return response.redirect('back');
    }

    const user = await User.find(id);

    if (!user) {
      response.redirect('404');
    }

    const pk = request.input('pickupdate');
    const rt = request.input('returnday');

    const p = pk.split('/');
    const pickdate = `${p[2]}/${p[1]}/${p[1]}`;

    const pick = Momento(new Date(pickdate)).format('YYYY-MM-DD');
    const drop = Momento(rt).format('YYYY-MM-DD');

    const deviceLivre = await reservaDevice.getDeviceLivres();
    if (!deviceLivre) {
      return response.send('nao ha device livre');
    }

    // const _lastbook = await Book.last() //nao funciona com uuid (sao gerados aleatoriamente)
    // eslint-disable-next-line no-underscore-dangle
    const _lastbook = await Book.query()
      .orderBy('created_at', 'asc')
      .last();

    const lastbook = !!_lastbook; // _lastbook ? true : false;

    // eslint-disable-next-line no-underscore-dangle
    const _prevHash = lastbook ? lastbook.curentHash : '000000'; // se nao existe um previos hash use o geneses hash

    const prevHash = await Hash.make(
      auth.user.id + Momento().format('YYYYMMDDHHmmss') + _prevHash
    );
    // e se pegar isso da sessao mesmo
    // eslint-disable-next-line no-underscore-dangle
    const curentHash = await Hash.make(
      auth.user.id + Momento().format('YYYYMMDDHHmmss') + prevHash
    );

    const book = await Book.findBy('check', check);
    let okbook = null;
    let newBook = null;
    let bookId = null;

    if (book) {
      // atualiza dados
      book.pickupDate = pick;
      book.returnday = drop;
      book.flynumber = request.input('flynumber');
      book.check = check;
      book.plano_id = request.input('plano_id');
      book.pickuplocation_id = request.input('pickuplocation_id');
      book.returnlocation_id = request.input('returnlocation_id');
      book.user_id = id;
      book.device_id = deviceLivre; // pegar um device livre ou q vai estar livre
      book.powerbank = request.input('powerbank') ? 1 : 0;
      book.prevHash = prevHash;
      book.curentHash = curentHash;

      okbook = await book.save();

      bookId = book.id;
    } else {
      // cria novo
      newBook = new Book();
      newBook.pickupDate = pick;
      newBook.returnday = drop;
      newBook.flynumber = request.input('flynumber');
      newBook.check = check;
      newBook.plano_id = request.input('plano_id');
      newBook.pickuplocation_id = request.input('pickuplocation_id');
      newBook.returnlocation_id = request.input('returnlocation_id');
      newBook.user_id = id;
      newBook.device_id = deviceLivre; // pegar um device livre ou q vai estar livre
      newBook.powerbank = request.input('powerbank') ? 1 : 0;
      newBook.prevHash = prevHash;
      newBook.curentHash = curentHash;

      okbook = await newBook.save();

      bookId = newBook.id;
    }

    if (!okbook) {
      return response.send('Nao foi possivel criar um book');
    }

    return response.redirect(`/reservas/pagareserva/${bookId}?check=${check}`);
  }

  async pagareserva({ view, params, request }) {
    const { check } = request.get();
    const { id } = params;

    const book = await Book.find(id);

    if (!book && !id) {
      return view.render('404');
    }

    const plano = await Plan.find(book.plano_id);
    const device = await Device.find(book.device_id);

    /**
     * pegar a deferenca dos dias
     */
    const x = new Momento(book.pickupdate);
    const y = new Momento(book.returnday);

    // var duration = Momento.duration(x.diff(y, 'days'))
    const numdays = y.diff(x, 'days');
    // console.log(numdays);

    // forma da reserva
    // tem de pegar este book do bd!!!!!!
    const configs = await Config.first();
    const config = configs.toJSON();
    const { txaluguer } = config;

    // formula para calcular dias = book.returnday - book.pickupdate
    const subtotal = parseFloat((txaluguer * numdays + plano.preco).toFixed(2));

    let caucao = null;
    let total = null;
    if (book.powerbank) {
      caucao = Number(config.caucao) + 20; // com powerbank
      total = parseFloat((subtotal + caucao).toFixed(2)); // 50 de causao
    } else {
      total = parseFloat((subtotal + Number(config.caucao)).toFixed(2)); // 50 de causao
      caucao = Number(config.caucao); // sem powerbank
    }

    // get pagar reserva dados
    const pagaInfo = {
      bookId: id,
      cliente: book.user_id,
      pickdate: Momento(book.pickupdate).format('DD/MM/YYYY'),
      dropdate: Momento(book.returnday).format('DD/MM/YYYY'),
      deviceid: book.device_id,
      devicenome: device.nome,
      devicenum: device.numero,
      devicefoto: device.photo,
      megas: `${plano.megas}`,
      plano: plano.nome,
      powerbank: book.powerbank ? 'sim' : 'nao',
      subtotal,
      total,
      cve: (total * Number(config.txcambio)).toFixed(0),
      check,
    };

    return view.render('reserva.pagar', {
      Lugar: 'Ordem De Reserva',
      config, // permite faze o switch de online para offline do frontend
      // bookId,
      // Cliente: paramsId,
      check,
      PagarData: pagaInfo,
    });
  }

  async guardarpagar({ response, request, session, auth, params }) {
    // console.log(params);
    // console.log(request);
    const { id } = params;

    const validation = await validateAll(request.all(), {
      valor: 'required',
      tipo: 'required',
    });

    // const { cve } = request.get();

    if (!id) return response.redirect('/404');

    if (validation.fails()) {
      session.withErrors(validation.messages());
      return response.redirect('back');
    }

    const tipo = request.input('tipo');

    // let cve = null;
    // if (tipo === '10' || tipo === '11') {
    //   cve = request.input('valor');
    // }

    // define o booking como
    const book = await Book.find(params.id);

    if (!book) {
      session.flash({
        bookpay: 'Book Not Found, try again',
      });
      return response.redirect('/profile');
    }

    book.check = null;
    await book.save();

    /**
     * enviar qrcode para cloudnary
     */
    const conteudo = `${Env.get('APP_URL')}/reservas/info/${book.id}`;

    let ImageLink = null;
    if (tipo !== '01') {
      ImageLink = await Cloudinary.sendQRcodeToCloudinary(
        conteudo,
        auth,
        book.id,
        session
      );
    }

    // fazer o pagamento( adicionar dados na tabela payment)
    const merchantRef = `R${book.prevHash.substring(0, 14)}`;

    const pagamento = new Pay();
    pagamento.merchantRespPurchaseAmount = request.input('valor');
    pagamento.tipo = tipo;
    pagamento.merchantRef = merchantRef;
    pagamento.booking_id = book.id;
    await pagamento.save();

    // codigo de pagamento para wifianywhere
    // if (tipo !== '11' || tipo !== '10') {
    //   session.flash({
    //     notification: {
    //       type: 'warning',
    //       message: 'Houve um erro no pagamento da reserva, tente mais tarde!',
    //     },
    //   });

    //   // return response.redirect(`/user/info/${auth.user.id}/book/${book.id}`);
    //   return response.send(
    //     'pagamento Houve um erro no pagamento da reserva, tente mais tarde!'
    //   );
    // }

    // dados para o email de confirmacao
    const config = await Config.first();

    // const config = configs.toJSON();

    const PL = await Plan.find(book.plano_id);
    const Pl = await Place.find(book.pickuplocation_id);
    const R = await Place.find(book.returnlocation_id);
    const user = await User.find(book.user_id);

    const Confirmacao = {
      cliente: {
        nome: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
      },
      book: {
        id: params.id,
        preco: Math.ceil(
          Number(pagamento.merchantRespPurchaseAmount) / Number(config.txcambio)
        ),
        pickupdate: Momento(book.pickupdate).format('DD/MM/YYYY'),
        dropoffdate: Momento(book.returnday).format('DD/MM/YYYY'),
        image: ImageLink,
      },
      plano: {
        nome: PL.nome,
        megas: PL.megas,
      },
      place: {
        pickup: Pl.nome,
        dropoff: R.nome,
      },
    };

    // enviar o email de confirmacao de pagamento (usando events)
    if (tipo !== '01') {
      Event.fire('cliente::confirmBook', Confirmacao);
    }

    // return response.send('...pagamento...efetuado com sucesso...');
    return response.redirect(`/reservas/info/${book.id}`);
  }

  async pagarPreReserva({ response, request, params, auth, session }) {
    const { tipo } = request.all();
    const { payid } = params;

    if (!payid || payid === 'undefined' || !tipo) {
      // flash message
      session.withErrors('id do pagameto nao existe');
      return response.redirect('back');
    }

    const validation = await validateAll(request.all(), {
      tipo: 'required',
    });

    if (validation.fails()) {
      session.withErrors(validation.messages());
      return response.redirect('back');
    }

    // get payment and booking data
    const payment = await Pay.find(payid);

    if (payment.tipo == tipo) {
      session.withErrors('Erro ao tentar pagar a Pre-reserva');
      return response.redirect('back');
    }

    const book = await Book.find(payment.booking_id);

    // mudar o tipo de pagamento
    payment.tipo = tipo;
    await payment.save();

    // create qr-code
    /**
     * enviar qrcode para cloudnary
     */
    const conteudo = `${Env.get('APP_URL')}/reservas/info/${book.id}`;

    let ImageLink = null;

    ImageLink = await Cloudinary.sendQRcodeToCloudinary(
      conteudo,
      auth,
      book.id,
      session
    );

    // send confirmation email

    // dados para o email de confirmacao
    const config = await Config.first();

    // const config = configs.toJSON();

    const PL = await Plan.find(book.plano_id);
    const Pl = await Place.find(book.pickuplocation_id);
    const R = await Place.find(book.returnlocation_id);
    const user = await User.find(book.user_id);

    const Confirmacao = {
      cliente: {
        nome: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
      },
      book: {
        id: params.id,
        preco: Math.ceil(
          Number(payment.merchantRespPurchaseAmount) / Number(config.txcambio)
        ),
        pickupdate: Momento(book.pickupdate).format('DD/MM/YYYY'),
        dropoffdate: Momento(book.returnday).format('DD/MM/YYYY'),
        image: ImageLink,
      },
      plano: {
        nome: PL.nome,
        megas: PL.megas,
      },
      place: {
        pickup: Pl.nome,
        dropoff: R.nome,
      },
    };

    // enviar o email de confirmacao de pagamento (usando events)

    Event.fire('cliente::confirmBook', Confirmacao);

    return response.redirect('back');
  }

  async recarregar({ response, request, params }) {
    const dados = request.all();
    const plan = await Plan.find(dados.plano_id);

    // get config
    const configs = await Config.first();
    // console.log(configs)
    const config = configs.toJSON();

    // criando o formulario de envio para o sisp

    // CONFIGURACOES wifianywhere
    // var posID = "90000063"
    // var posAutCode = "WNLzClRHixeJUAsx"
    // CONFIGURACOES teste
    // var posID = "90051"
    // var posAutCode = "123456789A"

    // OBTER DADOS DE PAGAMENTO
    var amount = parseInt(
      Number(plan.preco) * Number(config.txcambio),
      10
    ).toString();
    console.log(amount);
    // return

    const merchantRef = `R${Momento().format('YYYYMMDDHHmmss')}`;
    const merchantSession = `S${Momento().format('YYYYMMDDHHmmss')}`;
    const dateTime = Momento().format('YYYY-MM-DD HH:mm:ss');

    // url de callback  https://mc.vinti4net.cv/VbV_Merchant_Example_v2/merchantResp.jsp
    // var responseUrl = 'https://mc.vinti4net.cv/VbV_Merchant_Example_v2/merchantResp.jsp'
    const responseUrl = `${Env.get('APP_URL')}/reservas/recargaCallback`;

    // pegar o numero do device
    const books = await Book.find(params.bookid);
    const book = books.toJSON();
    console.log('book id:');
    console.log(book);
    const DeviceNumeros = await Device.find(book.device_id);
    const DeviceNumero = DeviceNumeros.toJSON();
    console.log('Device numero:');
    console.log(DeviceNumero.numero);

    // return
    // tem que bai Modulo sisp
    const formData = {
      transactionCode: '3', // opcao 3 para recarregamento
      posID: Env.get('posId'),

      merchantRef,
      merchantSession,

      amount,
      currency: '132',

      is3DSec: '1',
      urlMerchantResponse: responseUrl, // tambem conhecido como meu url de callback

      languageMessages: 'pt',
      timeStamp: dateTime,

      fingerprintversion: '1',

      entityCode: Env.get('CvmovelEntityCode'), // code para cvmovel (obrigatorio), ver com a sisp
      referenceNumber: DeviceNumero.numero.toString(), // numero a ser recarregado (obrigatorio)
    };

    // criando o objecto fingerprint baseado no formData
    formData.fingerprint = Sisp.GerarFingerPrintEnvio(
      Env.get('posAutoCode'),
      formData.timeStamp,
      formData.amount,
      formData.merchantRef,
      formData.merchantSession,
      formData.posID,
      formData.currency,
      formData.transactionCode,
      formData.entityCode,
      formData.referenceNumber
    );

    // console.log("formData out");
    // console.log(formData);

    // gerar o formulario de envio
    const formHtml = Sisp.autoPost(formData);

    console.log('formHtml');
    console.log(formHtml);

    // enviar a requisicao para o sisp
    console.log('formHtml enviando para o sisp');
    response.send(formHtml);
    // response.send(request.all() + ' || ' + formHtml)
  }

  async recargaCallback({ response, request }) {
    response.send(request.all());
  }
}

module.exports = ReservaController;
