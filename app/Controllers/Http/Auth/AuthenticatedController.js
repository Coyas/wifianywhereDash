'use strict'

class AuthenticatedController {
    async logout({ auth, response }){
        await auth.logout()

        return response.redirect('/auth/login')
    }
}

module.exports = AuthenticatedController
