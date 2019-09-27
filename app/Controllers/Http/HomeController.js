'use strict'

class HomeController {
    index({ view }) {
        return view.render('home.welcome')
    }
}

module.exports = HomeController
