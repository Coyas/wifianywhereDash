'use strict';
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
// const querystring = require('querystring')
const randomString = require('random-string');

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
      config: config,
    });
  }

  async listar({ view, params }) {
    const config = await Config.first();
    const book = await Book.query()
      .where('user_id', params.id)
      .fetch();

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

    const user = await User.find(params.id);
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
      config: config,
    });
  }

  async info({ view, params }) {
    //pegar as configuracoes do app
    const config = await Config.first();
    //essa pesquisa vai ter que ser mais elaborado pois, vai precisar verificar o estatus do booking e pegar so os finalizados
    const book = await Book.find(params.id);
    //verificar se o booking existe, pois se nao existir vai apresentar error nas outras pesquisas
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
    };

    return view.render('reserva.info', {
      dados: info,
      config: config,
      Planos,
    });
  }

  async pegar({ response, params }) {
    console.log(params.id);

    const a = Momento().format('Y-M-D');
    const book = await Book.find(params.id);
    book.showup = a;
    await book.save();

    //fazer recaregamento de saldo

    response.redirect(`/reservas/info/${book.id}`);
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
  async novareserva({ view, params, auth }) {
    const config = await Config.first();

    if (!params.id) {
      return view.render('404');
    }

    const user = await User.find(params.id);

    // console.log('randomString')
    // const cripto = randomString({
    //   length: 40
    // });

    const cripto = await Utils.generateCheck(auth);
    // console.log(cripto)

    return view.render('reserva.novo', {
      Lugar: 'Nova Reserva',
      config,
      User: user,
      check: cripto,
    });
  }

  async guardareserva({ response, params, request, session }) {
    console.log(request.all());
    // validar campos de formulario
    const validation = await validateAll(request.all(), {
      firstName: 'required',
      lastName: 'required',
      email: 'required',
      street_address: 'required',
      city: 'required',
      country: 'required',
      zip_code: 'required',
      phone: 'required',
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
    // console.log("request check data: ");
    const { check } = request.get();
    // console.log(request.get());

    const ok = await Utils.verificarCheck(check, auth);
    if (!ok) {
      return view.render('404');
    }

    const config = await Config.first();

    const user = await User.find(params.id); // id pertence ao user

    if (!user) {
      return view.render('404');
    }

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
      Cliente: params.id, // id do user
      Local: local,
      check,
    });
  }

  async guardarplanos({ response, request, params, session, auth }) {
    // console.log('params id(cliente id): ')
    // console.log(params.id)
    // console.log('queryString do input:')
    // console.log(request.all())
    const { check } = request.all();

    const ok = await Utils.verificarCheck(check, auth);
    if (!ok && !params.id && !check) {
      return response.redirect('/404');
    }

    // console.log(request.all());
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
      // console.log('create user validation error: ')
      // console.log(validation.messages())
      return response.redirect('back');
    }

    const user = await User.find(params.id);

    if (!user || !params.id) {
      response.redirect('404');
    }

    const pk = request.input('pickupdate');
    const rt = request.input('returnday');

    const p = pk.split('/');
    const pickdate = `${p[2]}/${p[0]}/${p[1]}`;
    const d = rt.split('/');
    const dropdate = `${d[2]}/${d[0]}/${d[1]}`;

    const pick = Momento(new Date(pickdate)).format('YYYY-MM-DD');
    const drop = Momento(new Date(dropdate)).format('YYYY-MM-DD');

    // get device livre
    // let deviceLivre = any;
    // do {
    console.log('executando o doWhile getDeviceLivre');
    const deviceLivre = await reservaDevice.getDeviceLivres();
    if (!deviceLivre) {
      return response.send('nao ha device livre');
    }

    // } while (deviceLivre === false);

    console.log(`device livre: ${deviceLivre}`);
    if (!deviceLivre) {
      return response.redirect('/404');
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

    console.log('Criando o booking...');

    const book = new Book();
    book.pickupDate = pick;
    book.returnday = drop;
    book.flynumber = request.input('flynumber');
    book.check = check;
    book.plano_id = request.input('plano_id');
    book.pickuplocation_id = request.input('pickuplocation_id');
    book.returnlocation_id = request.input('returnlocation_id');
    book.user_id = params.id;
    book.device_id = deviceLivre; // pegar um device livre ou q vai estar livre
    book.powerbank = 0;
    book.prevHash = prevHash;
    book.curentHash = curentHash;

    const okbook = await book.save();

    if (!okbook) {
      return response.send('Nao foi possivel criar um book');
    }

    // response.send('book criado com sucesso  ')
    return response.redirect(`/reservas/pagareserva/${book.id}?check=${check}`);
  }

  async pagareserva({ view, params, request }) {
    console.log('request check data: ');
    const { check, paramsId } = request.get();
    // const bookId = params.id
    console.log(`${check}`);

    // console.log("params.id:");
    // console.log(params.id);
    const book = await Book.find(params.id);

    console.log('book');
    console.log(book.pickupdate);

    if (!book && !params.id) {
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
    console.log(numdays);

    // forma da reserva
    // tem de pegar este book do bd!!!!!!
    const configs = await Config.first();
    const config = configs.toJSON();
    const txalugar = config.txaluguer;

    // formula para calcular dias = book.returnday - book.pickupdate
    const subtotal = parseFloat((txalugar * numdays + plano.preco).toFixed(2));

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
      bookId: params.id,
      cliente: paramsId,
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
      // check,
      PagarData: pagaInfo,
    });
  }

  async guardarpagar({ response, request, session, auth, params }) {
    // console.log(params);
    // console.log(request);

    const validation = await validateAll(request.all(), {
      valor: 'required',
      tipo: 'required',
    });

    const { cve } = request.get();
    console.log('pagamento valor');
    console.log(cve);

    if (!params.id) return response.redirect('/404');

    if (validation.fails()) {
      session.withErrors(validation.messages());
      // console.log('create user validation error: ')
      // console.log(validation.messages())
      return response.redirect('back');
    }

    if (request.input('valor') !== cve) {
      return response.redirect('back');
    }

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
    const conteudo = `${Env.get('BACK_URL')}/reservas/info/${book.id}`;
    const ImageLink = await Cloudinary.sendQRcodeToCloudinary(
      conteudo,
      auth,
      book.id,
      session
    );

    // fazer o pagamento( adicionar dados na tabela payment)
    const merchantRef = `R${book.prevHash.substring(0, 14)}`;

    const pagamento = new Pay();
    pagamento.merchantRespPurchaseAmount = request.input('valor');
    pagamento.tipo = request.input('tipo');
    pagamento.merchantRef = merchantRef;
    pagamento.booking_id = book.id;
    await pagamento.save();

    // codigo de pagamento para wifianywhere
    if (pagamento.tipo !== 11) {
      session.flash({
        notification: {
          type: 'warning',
          message: 'Houve um erro no pagamento da reserva, tente mais tarde!',
        },
      });

      // return response.redirect(`/user/info/${auth.user.id}/book/${book.id}`);
      return response.send('pagamento');
    }

    // dados para o email de confirmacao
    const configs = Config.first();
    const config = configs.toJSON();

    const PL = await Plan.find(book.plano_id);
    const Pl = await Place.find(book.pickuplocation_id);
    const R = await Place.find(book.returnlocation_id);

    const Confirmacao = {
      cliente: {
        nome: `${auth.user.firstName} ${auth.user.lastName}`,
        email: auth.user.email,
        phone: auth.user.phone,
      },
      book: {
        id: params.id,
        preco: pagamento.merchantRespPurchaseAmount / Number(config.txcambio),
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
    Event.fire('user::confirmBook', Confirmacao);

    return response.send('...a...efetuar...pagamento...');
    // return response.redirect(`/user/info/${auth.user.id}/book/${book.id}`);
  }

  async getRecarregarAmount({ view, params, request }) {
    return view.render('reserva.pagar');
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
