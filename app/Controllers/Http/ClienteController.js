// 'use strict';
/* global use */
const User = use('App/Models/User');
const Book = use('App/Models/Booking');
// const Pay = use('App/Models/Payment');
const Config = use('App/Models/Config');
const { validateAll } = use('Validator');
// const Mail = use('Mail');
// const Env = use('Env');
const Event = use('Event');
const Utils = use('App/Services/Utils');
const randomString = require('random-string');

class ClienteController {
  async lista({ view }) {
    const config = await Config.first();
    const user = await User.query()
      .where('access', '=', 1)
      .fetch(); // um usuario de nivel maior que 1 pode ser um cliente?

    if (!user) view.render('404');

    const users = user.toJSON();

    // const book = await Book.query().where('user_id', users[i].id)
    // const books = book.toJSON();

    // await Book.query()
    //   .where('user_id', users[i].id)
    //   .fetch();

    /**
     * objeto para listar clientes
     */
    let Users = [];
    let username = '';
    for (let i = 0; i < users.length; i++) {
      if (users[i].firstName == null || users[i].lastName == null) {
        username = users[i].username;
      } else {
        username = users[i].firstName + ' ' + users[i].lastName;
      }

      const { id } = users[i];
      // eslint-disable-next-line no-await-in-loop
      const bookCount = await Book.query()
        .where('user_id', id)
        .count('id as id');

      Users[i] = {
        id: user ? users[i].id : 'null',
        avatar: user ? users[i].avatar : 'null',
        nome: username,
        estado:
          users[i].is_active == 1
            ? '<i class="bg-success"></i> ativo'
            : '<i class="bg-danger"></i> inativo',
        reservas: bookCount[0].id,
        recargas: '00',
        completo: '00',
      };
    }

    return view.render('cliente.lista', {
      Lugar: 'Lista de Clientes',
      User: Users,
      config,
    });
  }

  async info({ view, params, request, auth, response }) {
    const config = await Config.first();
    const users = await User.find(params.id);
    const cripto = await Utils.generateCheck(auth);

    if (!users) {
      return response.redirect('/404');
    }

    // Activate user
    const { activate } = request.get();
    if (activate === 'true') {
      users.is_active = 1;
    } else if (activate === 'false') {
      users.is_active = 0;
    }
    await users.save();

    const user = users.toJSON();

    const books = await Book.query()
      .where('user_id', user.id)
      .fetch();
    const book = books.toJSON();
    // console.log(book);

    const dados = {
      id: user.id,
      cliente: user.firstName + ' ' + user.lastName,
      reservas: book.length,
      recargas: '0',
      firstName: user.firstName,
      lastName: user.lastName,
      city: user.city,
      country: user.country,
      email: user.email,
      avatar: user.avatar,
      username: user.username,
      ativo: user.ativo,
      street_address: user.street_address,
      biling_address: user.biling_address,
      zip_code: user.zip_code,
      phone: user.phone,
      sobreme: user.sobreme,
      isActive: user.is_active,
    };

    return view.render('cliente.info', {
      Lugar: `Cliente Username:  ${dados.username}`,
      User: dados,
      config,
      cripto,
    });
  }

  async newcliente({ view }) {
    const config = await Config.first();

    return view.render('cliente.novo', {
      Lugar: `Novo CLiente`,
      config,
      pass: randomString({
        length: 10,
      }),
    });
  }

  async savecliente({ request, response, session }) {
    // const userData = request.only(['nome', 'apelido', 'username', 'email', 'street_address', 'biling_address', 'city', 'country', 'zip_code', 'sobreme'])

    // validar campos de formulario
    const validation = await validateAll(request.all(), {
      username: 'required|unique:users,username',
      firstName: 'required',
      lastName: 'required',
      email: 'required|email|unique:users,email',
      street_address: 'required',
      city: 'required',
      country: 'required',
      zip_code: 'required',
      phone: 'required',
      password: 'required',
    });

    if (validation.fails()) {
      session.withErrors(validation.messages());
      // console.log('create user validation error: ')
      // console.log(validation.messages())
      return response.redirect('back');
    }

    const userData = {
      username: request.input('username'),
      firstName: request.input('firstName'),
      lastName: request.input('lastName'),
      email: request.input('email'),
      street_address: request.input('street_address'),
      biling_address: request.input('biling_address'),
      city: request.input('city'),
      country: request.input('country'),
      zip_code: request.input('zip_code'),
      sobreme: request.input('sobreme'),
      // is_active: -> default 0
      password: request.input('password'),
      confirmation_token: randomString({
        length: 40,
      }),
      phone: request.input('phone'),
    };

    // console.log(userData);

    // response.send('create cliente');
    // save and get instance back
    const user = await User.create(userData);

    if (!user) {
      response.redirect('back');
    }
    // enviar email de confirmacao
    // console.log('sending email...');

    Event.fire('new::cliente', userData);

    // console.log('flashing messages...');
    session.flash({
      notification: {
        type: 'success',
        message:
          'successful registration! an email has been sent to your email address',
      },
    });

    // redirecionar para a pagina clientes
    return response.redirect('/clientes');
  }
}

module.exports = ClienteController;
