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

// testes de rotas e cruds
// Route.on('/').render('home').as('home').middleware(['auth'])
// rotas das paginas sem controle de autenticacao
Route.get('/', 'HomeController.index').middleware(['auth'])

// rotas de autenticacao e signup

Route.get('/auth/register', 'Auth/RegisterController.showform').middleware(['authendicated'])

Route.post('/auth/register', 'Auth/RegisterController.register')

// confirmacao de email
Route.get('register/confirm/:token', 'Auth/RegisterController.confirmEmail')

// login
Route.get('/auth/login', 'Auth/LoginController.showformlogin').middleware(['authendicated'])

Route.post('/auth/login', 'Auth/LoginController.login')

// logout
Route.get('logout', 'Auth/AuthenticatedController.logout')

// reset passwor by email
Route.get('password/reset', 'Auth/PasswordResetController.showLinkRequestForm')

Route.post('password/email', 'Auth/PasswordResetController.sendResetLinkEmail')

// reset password token
Route.get('password/reset/:token', 'Auth/PasswordResetController.showResetForm')

Route.post('password/reset', 'Auth/PasswordResetController.reset')


/**
 *  Error handler pages
 * 
 * 404 - page not found
 * 500 - internal server error
 */
// 404 pages
Route.any('*', async ({ view, response}) => {
      
    // return view.render('main')
    return response.status(404).send('404 page')
    // if(response.status(404)){
    //   return view.render('404')
    // }
  
  })