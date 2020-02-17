/* eslint-disable no-plusplus */
// 'use strict';
/* global use */
const User = use('App/Models/User');
const Book = use('App/Models/Booking');
const Plan = use('App/Models/Plan');
const Subs = use('App/Models/Subscribe');
const Faq = use('App/Models/Faq');
const Category = use('App/Models/Category');
const Config = use('App/Models/Config');
const Device = use('App/Models/Device');
const { validateAll } = use('Validator');
const moment = use('moment');
const Deviceproperty = use('App/Models/Deviceproperty');
const Database = use('Database');

class HomeController {
  async index({ view }) {
    const config = await Config.first();
    const book = await Book.query().fetch();
    const books = book.toJSON();

    const user = await User.query().fetch();
    const users = user.toJSON();

    const info = {
      users: users.length,
      reservas: books.length,
    };

    const Reservas = [];

    for (let i = 0; i < books.length; i++) {
      const plano = await Plan.find(books[i].plano_id);
      const cliente = await User.find(books[i].user_id);

      if (!cliente) view.render('404');
      if (!plano) view.render('404');

      const data = moment(books[i].pickupdate).format('DD-MM-YYYY');
      const data2 = moment(books[i].returnday).format('DD-MM-YYYY');

      Reservas[i] = {
        id: books[i].id,
        plano: plano.nome,
        cliente: `${cliente.firstName} ${cliente.lastName}`,
        pickupDate: data,
        returnDate: data2,
      };
    }

    return view.render('home.welcome', {
      Lugar: 'Dashboard',
      info,
      Reservas,
      config,
    });
  }

  async subscrito({ view }) {
    const config = await Config.first();

    const sub = await Subs.all();
    const subs = sub.toJSON();
    const table = [];

    // const

    for (let i = 0; i < subs.length; i++) {
      table[i] = {
        index: i,
        id: subs[i].id,
        email: subs[i].email,
      };
    }

    console.log(table);
    return view.render('home.subscrito', {
      Lugar: 'Subscritos',
      Table: table,
      config: config,
    });
  }

  async apagasubscrito({ params, view, response, auth }) {
    if (auth.user.access >= 3) {
      const sub = await Subs.find(params.id);
      await sub.delete();

      response.redirect('back');
    } else {
      return view.render('404');
    }
  }

  async faqs({ view }) {
    const config = await Config.first();

    // const faq = await Faq.all();
    // const Table = await faq.categories().fetch();
    // const Table = await Faq.query()
    //   .with('categories')
    //   .fetch();

    // const Tables = await Faq.query()
    //   .with('categories')
    //   .fetch();

    const Table = [];
    // const a = Tables.toJSON();

    /**
     * title
     * categoria
     * lang
     * descricao
     */

    // let catego = [];
    // select faqs.title, categories.nome, categories.lang, faqs.lang from faqs, categories inner join category_faq where faqs.id=faq_id and categories.id=category_id;
    const ab = await Database.raw(
      'select faqs.id as id, faqs.title as title, categories.nome as categoria, faqs.lang as lang, faqs.descricao as descricao from faqs, categories inner join category_faq where faqs.id=faq_id and categories.id=category_id'
    );

    if (ab[0].length <= 0) {
      Table[0] = {
        id: '',
        title: 'sem faqs disponivel',
        lang: '',
        categoria: '',
        descricao: '',
      };
    } else {
      for (let i = 0; i < ab[0].length; i++) {
        Table[i] = {
          id: ab ? ab[0][i].id : null,
          title: ab[0][i].title,
          lang: ab[0][i].lang,
          categoria: ab[0][i].categoria,
          descricao: `${ab[0][i].descricao.substring(0, 50)}...`,
        };
      }
    }

    return view.render('faqs.index', {
      config,
      Table,
    });
  }

  async novofaqs({ view }) {
    const config = await Config.first();

    return view.render('faqs.novo', {
      config,
    });
  }

  async guardarfaqs({ request, session, response, auth }) {
    if (auth.user.access < 3) {
      return response.render('404');
    }

    const dados = request.all();
    // validar campos de formulario
    const validation = await validateAll(request.all(), {
      title: 'required',
      descricao: 'required',
    });

    if (validation.fails()) {
      session.withErrors(validation.messages());

      return response.redirect('back');
    }

    const faq = new Faq();
    faq.title = dados.title;
    faq.descricao = dados.descricao;
    faq.lang = dados.lang;
    await faq.save();

    await faq.categories().attach([dados.category]);

    // const User = use('App/Models/User');
    // const Car = use('App/Models/Car');

    // const mercedes = await Car.findBy('reg_no', '39020103');
    // const user = await User.find(1);

    // await user.cars().attach([mercedes.id]);

    return response.redirect('/faqs');
  }

  async updatefaqs({ view, auth, params }) {
    const config = await Config.first();
    if (auth.user.access < 3) {
      return view.render('404');
    }

    const faq = await Faq.find(params.id);
    const faqs = faq.toJSON();

    return view.render('faqs.update', {
      dados: faqs,
      config,
    });
  }

  async updatefaq({ response, request, params, session, auth }) {
    if (auth.user.access < 3) {
      return response.render('404');
    }

    const dados = request.all();
    // console.log('update faq');
    // validar campos de formulario
    const validation = await validateAll(request.all(), {
      title: 'required',
      descricao: 'required',
    });

    // console.log('update faq validation');
    if (validation.fails()) {
      session.withErrors(validation.messages());
      // console.log('update faq validation error');
      return response.redirect('back');
    }

    // console.log('find faq');
    const faq = await Faq.find(params.id);
    faq.title = dados.title;
    faq.descricao = dados.descricao;
    await faq.save();

    return response.redirect(`/faqs/view/${params.id}`);
  }

  async viewfaqs({ view, params }) {
    const config = await Config.first();

    const faq = await Faq.find(params.id);

    if (!faq) {
      return view.render('404');
    }

    const faqs = faq.toJSON();

    return view.render('faqs.view', {
      Data: faqs,
      config,
    });
  }

  async apagarfaqs({ params, auth, response }) {
    if (auth.user.access < 3) {
      return response.redirect('/404');
    }

    const faqId = params.id;

    // select faqs.id, categories.id from faqs, categories inner join category_faq where faqs.id=faq_id and categories.id=category_id;
    const rst = await Database.raw(
      'select faqs.id as faqId, categories.id as categoriaId from faqs, categories inner join category_faq where faqs.id=category_faq.faq_id and categories.id=category_faq.category_id and faqs.id=?',
      [faqId]
    );

    // rst[0][0].faqId
    // rst[0][0].categoriaId

    const id = rst[0][0].categoriaId;

    const faq = await Faq.find(faqId);
    const faqCatego = await Category.findBy('id', id);
    if (!faqCatego) return response.redirect('/404');

    const s = await faq.categories().detach([faqCatego.id]);
    if (!s) return response.redirect('/404');

    await faq.delete();

    return response.redirect('/faqs');
  }

  async getcategoria({ request, response }) {
    const dados = request.all();
    // console.log(dados.lang);

    const catego = await Category.query()
      .where('lang', dados.lang)
      .fetch();
    // console.log(catego)
    // const cat = catego.toJSON()
    if (catego) {
      // let data = []
      // for(let i = 0; i < cat.length;i++){
      //     data[i]
      // }
      response.json(catego);
    } else {
      const data2 = {};
      response.json(data2);
    }
  }

  /**
   *
   * pegar dados sobre planos e devices
   */
  async getdados({ response, request }) {
    const dados = request.all();
    // console.log(`dados:`);
    // console.log(dados);

    if (!dados) {
      response.json({
        plano: 'sem dados',
      });
    }
    const plano = await Plan.find(dados.plano);

    //get device livre ou que possam estar livres
    const device = await Device.find(2);

    if (plano && device) {
      // 1 - 1
      var obj = {
        caso: 1,
        plano: plano.nome,
        megas: plano.megas,
        preco: plano.preco,
        deviceid: device.id,
        devicenome: device.nome,
        devicenum: device.numero,
        devicefoto: device.photo || 'Sem imagem desponivel',
      };
    } else if (plano && !device) {
      // 1 - 0
      var obj = {
        caso: 2,
        plano: plano.nome,
        megas: plano.megas,
        preco: plano.preco,
        device: 'Sem Despositivos Livres',
      };
    } else if (!plano && device) {
      // 0 - 1
      var obj = {
        caso: 3,
        plano: 'Não existem planos disponíveis',
        deviceid: device.id,
        devicenome: device.nome,
        devicenum: device.numero,
        devicefoto: device.photo || 'Sem imagem desponivel',
      };
    } else {
      // 0 - 0
      var obj = {
        caso: 4,
        plano: 'Não existem planos disponíveis',
        device: 'Sem Despositivos Livres',
      };
    }

    return response.json(obj);
  }

  async siteconfig({ request, response }) {
    const dados = request.all();
    console.log(dados);

    const config = await Config.first();
    config.online = dados.status;
    const a = await config.save();

    response.json(a);
  }
}

module.exports = HomeController;
