'use strict'

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
const Route = use('Route')

Route.group(() => {

  Route.get('/', 'HomeController.index')
  Route.get('/subscrito', 'HomeController.subscrito')
  Route.get('/apagasubscrito/:id', 'HomeController.apagasubscrito')
  Route.get('/faqs', 'HomeController.faqs')
  Route.get('/faqs/novo', 'HomeController.novofaqs')
  Route.post('/faqs/novo', 'HomeController.guardarfaqs')
  Route.get('/faqs/view/:id', 'HomeController.viewfaqs')
  Route.get('/faqs/update/:id', 'HomeController.updatefaqs')

  // rota para clientes
  Route.get('/clientes', 'ClienteController.lista')//listar todos os clientes
  Route.get('/clientes/info/:id', 'ClienteController.info')//ver o perfil do cliente
  
  // rotas para reservas
  Route.get('/reservas', 'ReservaController.lista')//listar todas as reservas
  Route.get('/reservas/:id', 'ReservaController.listar')//listar uma reserva especifica
  Route.get('/reservas/info/:id', 'ReservaController.info')//ver os detalhes de uma reserva especifica id reserva

  Route.get('/reservas/pegar/:id', 'ReservaController.pegar')
  Route.post('/reservas/devolver/:id', 'ReservaController.devolver')

  
  // rotas para usuarios
  Route.get('/user/:id', 'UserController.index')
  Route.put('/user/:id', 'UserController.editar')
  Route.get('/user/logs/:id', 'UserController.logs')
  Route.get('/user/senha/:id', 'UserController.mudarsenha')
  Route.post('/user/senha/:id', 'UserController.guardarsenha')

  // rotas de  signup
  Route.get('/auth/register', 'Auth/RegisterController.showform')

  Route.post('/auth/register', 'Auth/RegisterController.register') 

  Route.get('/usuarios', 'UsuarioController.index')


  // logout
  Route.get('logout', 'Auth/AuthenticatedController.logout')
  Route.get('/usuarios/isactive/:id', 'UsuarioController.isactive')
  Route.get('/usuarios/isdesativo/:id', 'UsuarioController.isdesativo') 

}).middleware(['auth'])

Route.group(() => { 
  // login
  Route.get('/auth/login', 'Auth/LoginController.showformlogin')

}).middleware(['authendicated'])

  // reset password by email
  Route.get('password/reset', 'Auth/PasswordResetController.showLinkRequestForm')

  Route.post('password/email', 'Auth/PasswordResetController.sendResetLinkEmail')

  // reset password token
  Route.get('password/reset/:token', 'Auth/PasswordResetController.showResetForm')

  Route.post('password/reset', 'Auth/PasswordResetController.reset')

// confirmacao de email
Route.get('register/confirm/:token', 'Auth/RegisterController.confirmEmail')

Route.post('/auth/login', 'Auth/LoginController.login')



/**
 *  Error handler pages
 * 
 * 404 - page not found
 * 500 - internal server error
 */
// 404 pages
Route.any('*', async ({ view, response}) => {
      
    // return view.render('main')
    // return response.status(404).send('404 page')
    if(response.status(404)){
      return view.render('404')
    }
  
  })