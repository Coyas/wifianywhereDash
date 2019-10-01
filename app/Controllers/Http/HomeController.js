'use strict'

class HomeController {
    index({ view }) {
        return view.render('home.welcome', {
            Lugar: 'Dashboard'
        })
    }
    
    
}

module.exports = HomeController
