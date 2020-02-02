'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const uuidv4 = require('uuid/v4');

class Payment extends Model {
  static boot() {
    super.boot()

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    // this.addHook('beforeSave', async (userInstance) => { //esta 1 bug aqui, ele faz hash 2x
    this.addHook('beforeCreate', async (payInstance) => {

      payInstance.id = uuidv4.v4()

    })
  }


  booking() {
    return this.hasMany('App/Models/Booking')
  }

  static get incrementing() {
    return false
  }
}

module.exports = Payment
