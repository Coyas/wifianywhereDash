'use strict'

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const uuidv4 = require('uuid/v4')

class User extends Model {
  static boot() {
    super.boot()

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    // this.addHook('beforeSave', async (userInstance) => { //esta 1 bug aqui, ele faz hash 2x
    this.addHook('beforeCreate', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }

      // console.log(uuidv4.v4())
      userInstance.id = uuidv4.v4()

    })
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens() {
    return this.hasMany('App/Models/Token')
  }

  static get primaryKey() {
    return 'id'
  }

  static get hidden() {
    return ['password']
  }

  static get incrementing() {
    return false
  }

  booking() {
    return this.hasMany('App/Models/Booking')
  }

}

module.exports = User
