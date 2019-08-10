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
Route.on('/').render('home').as('home')

Route.get('/posts', 'PostController.index')

Route.get('/posts/add', 'PostController.add')

Route.get('/posts/edit/:id', 'PostController.edit')

Route.get('/posts/:id', 'PostController.details')

Route.post('/posts', 'PostController.store')

Route.put('/posts/:id', 'PostController.update')

Route.delete('/posts/:id', 'PostController.destroy')

// rotas de autenticacao e signup

Route.get('/auth/register', 'Auth/RegisterController.showform')

Route.post('/auth/register', 'Auth/RegisterController.register')

// confirmacao de email
Route.get('register/confirm/:token', 'Auth/RegisterController.confirmEmail')

// login
Route.get('/auth/login', 'Auth/LoginController.showformlogin')

Route.post('/auth/login', 'Auth/LoginController.login')

// logout
Route.get('logout', 'Auth/AuthenticatedController.logout')

// reset passwor by email
Route.get('password/reset', 'Auth/PasswordResetController.showLinkRequestForm')

Route.post('password/email', 'Auth/PasswordResetController.sendResetLinkEmail')
