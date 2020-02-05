'use strict';
const User = use('App/Models/User');
const Book = use('App/Models/Booking');
const Pay = use('App/Models/Payment');
const Config = use('App/Models/Config');
const { validate, validateAll } = use('Validator');
const randomString = require('random-string');
const Mail = use('Mail');
const Env = use('Env');
const Event = use('Event');

class ClienteController {
  async lista({ view }) {
    const config = await Config.first();
    const user = await User.query()
      .where('access', '=', 1)
      .fetch(); // um usuario de nivel maior que 1 pode ser um cliente?
    const users = user.toJSON();

    const book = await Book.all();
    const books = book.toJSON();

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

      Users[i] = {
        id: users[i].id,
        avatar: users[i].avatar,
        nome: username,
        estado:
          users[i].is_active == 1
            ? '<i class="bg-success"></i> ativo'
            : '<i class="bg-danger"></i> inativo',
        reservas: '00',
        recargas: '00',
        completo: '00',
      };
    }

    return view.render('cliente.lista', {
      Lugar: 'Lista de Clientes',
      User: Users,
      config: config,
    });
  }

  async info({ view, params, request }) {
    const config = await Config.first();
    const users = await User.find(params.id);

    // Activate user
    if (request.get('activate')) {
      users.is_active = 1;
      await users.save();
    }

    const user = users.toJSON();

    const books = await Book.query()
      .where('user_id', user.id)
      .fetch();
    const book = books.toJSON();
    console.log(book);

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
    };

    return view.render('cliente.info', {
      Lugar: `Cliente Username:  ${dados.username}`,
      User: dados,
      config: config,
    });
  }

  async newcliente({ view }) {
    const config = await Config.first();

    return view.render('cliente.novo', {
      Lugar: `Novo CLiente`,
      config: config,
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
    };

    console.log(userData);

    response.send('create cliente');
    // save and get instance back
    const user = await User.create(userData);

    if (user) {
      //enviar email de confirmacao
      console.log('sending email...');

      Event.fire('new::cliente', userData);

      console.log('flashing messages...');
      session.flash({
        notification: {
          type: 'success',
          message:
            'successful registration! an email has been sent to your email address',
        },
      });

      //redirecionar para a pagina clientes
      response.redirect('/clientes');
    } else {
      response.redirect('back');
    }
  }
}

module.exports = ClienteController;
