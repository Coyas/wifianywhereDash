// 'use strict';
/* global use */

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');
const Helpers = use('Helpers');
const User = use('App/Models/User');
const fs = require('fs');

Route.group(() => {
  Route.get('/', 'HomeController.index').middleware(['bookings']);
  Route.get('/subscrito', 'HomeController.subscrito').middleware(['bookings']);
  Route.get('/apagasubscrito/:id', 'HomeController.apagasubscrito').middleware([
    'bookings',
  ]);
  Route.get('/faqs', 'HomeController.faqs').middleware(['bookings']);
  Route.get('/faqs/novo', 'HomeController.novofaqs').middleware(['bookings']);
  Route.post('/faqs/novo', 'HomeController.guardarfaqs').middleware([
    'bookings',
  ]);
  Route.get('/faqs/view/:id', 'HomeController.viewfaqs').middleware([
    'bookings',
  ]);
  Route.get('/faqs/update/:id', 'HomeController.updatefaqs').middleware([
    'bookings',
  ]);
  Route.put('/faqs/update/:id', 'HomeController.updatefaq');
  Route.get('/faqs/apagar/:id', 'HomeController.apagarfaqs');

  // routas de ajax
  Route.get('/getcategoria', 'HomeController.getcategoria');
  Route.get('/siteconfig', 'HomeController.siteconfig');
  Route.get('/getdados', 'HomeController.getdados');

  // rota para clientes
  Route.get('/clientes', 'ClienteController.lista').middleware(['bookings']); // listar todos os clientes
  Route.get('/cliente/novo', 'ClienteController.newcliente').middleware([
    'bookings',
  ]); // rota para criar novo cliente
  Route.get('/clientes/info/:id', 'ClienteController.info').middleware([
    'bookings',
  ]); // ver o perfil do cliente savecliente
  Route.post('/clientes/novo', 'ClienteController.savecliente');

  // rotas para reservas
  Route.get('/reservas', 'ReservaController.lista'); // listar todas as reservas
  Route.get('/reservas/:id', 'ReservaController.listar'); // listar uma reserva especifica
  Route.get('/reservas/info/:id', 'ReservaController.info'); // ver os detalhes de uma reserva especifica id reserva

  Route.get('/reservas/pegar/:id', 'ReservaController.pegar');
  Route.post('/reservas/devolver/:id', 'ReservaController.devolver'); // id da reserva

  // nova reserva ---------------------------------------------------------------
  Route.get('/reservas/novareserva/:id', 'ReservaController.novareserva'); // id pertence ao user
  Route.put('/reservas/guardareserva/:id', 'ReservaController.guardareserva'); // id pertence ao user

  // choose plano
  Route.get('/reservas/chooseplano/:id', 'ReservaController.chooseplanos'); // id do user
  Route.post('/reservas/guardarplanos/:id', 'ReservaController.guardarplanos'); // id do user

  // pagar reserva
  Route.get('/reservas/pagareserva/:id', 'ReservaController.pagareserva'); // id do booking
  Route.post('/reservas/guardarpagar/:id', 'ReservaController.guardarpagar'); // id do booking

  Route.post(
    '/reservas/getRecarregarAmount/:bookid',
    'ReservaController.getRecarregarAmount'
  );
  Route.post(
    '/reservas/pagarprereserva/:payid',
    'ReservaController.pagarPreReserva'
  );
  Route.post('/reservas/recarregar/:bookid', 'ReservaController.recarregar');
  Route.post('/reservas/recargaCallback', 'ReservaController.recargaCallback');
  // ----------------------------------------------------------------------------

  // rotas para usuarios
  Route.get('/user/:id', 'UserController.index').middleware(['bookings']);
  Route.put('/user/:id', 'UserController.editar').middleware(['bookings']);
  Route.get('/user/logs/:id', 'UserController.logs').middleware(['bookings']);
  Route.get('/user/senha/:id', 'UserController.mudarsenha').middleware([
    'bookings',
  ]);
  Route.post('/user/senha/:id', 'UserController.guardarsenha').middleware([
    'bookings',
  ]);

  // rotas de  signup
  Route.get('/auth/register', 'Auth/RegisterController.showform').middleware([
    'bookings',
  ]);

  Route.post('/auth/register', 'Auth/RegisterController.register');

  Route.get('/usuarios', 'UsuarioController.index').middleware(['bookings']);

  // logout
  Route.get('logout', 'Auth/AuthenticatedController.logout');
  Route.get('/usuarios/isactive/:id', 'UsuarioController.isactive');
  Route.get('/usuarios/isdesativo/:id', 'UsuarioController.isdesativo');

  // website routes
  Route.get('/website', 'WebsiteController.index');
  Route.get('/website/banners/', 'WebsiteController.banners');

  // rota para aploud
  Route.post('/website/upload/', 'WebsiteController.upload');
}).middleware(['auth']);

Route.group(() => {
  // login
  Route.get('/auth/login', 'Auth/LoginController.showformlogin');
}).middleware(['authendicated']);

// reset password by email
Route.get('password/reset', 'Auth/PasswordResetController.showLinkRequestForm');

Route.post('password/email', 'Auth/PasswordResetController.sendResetLinkEmail');

// reset password token
Route.get(
  'password/reset/:token',
  'Auth/PasswordResetController.showResetForm'
);

Route.post('password/reset', 'Auth/PasswordResetController.reset');

// confirmacao de email
Route.get('register/confirm/:token', 'Auth/RegisterController.confirmEmail');

Route.post('/auth/login', 'Auth/LoginController.login');

/**
 *  Error handler pages
 *
 * 404 - page not found
 * 500 - internal server error
 */
// 404 pages
Route.any('*', async ({ view, response }) => {
  // return view.render('main')
  // return response.status(404).send('404 page')
  if (response.status(404)) {
    return view.render('404');
  }
});
