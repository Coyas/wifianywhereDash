'use strict'

class ClienteController {
    lista({ view }) {
        return view.render('cliente.lista', {
            Lugar: 'Lista de Clientes'
        })
    }

    info({view}){
        return view.render('cliente.info', {
            Lugar: 'Info de Clientes'
        })
    }
}

module.exports = ClienteController
