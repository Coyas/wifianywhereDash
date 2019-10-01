'use strict'

class ClienteController {
    clientes({ view }) {
        return view.render('cliente.index')
    }
}

module.exports = ClienteController
