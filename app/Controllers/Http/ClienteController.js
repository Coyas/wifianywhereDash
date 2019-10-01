'use strict'

class ClienteController {
    clientes({ view }) {
        return view.render('cliente.index', {
            Lugar: 'Clientes'
        })
    }
}

module.exports = ClienteController
