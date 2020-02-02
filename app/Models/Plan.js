'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
// const uuidv4    = require('uuid/v4');

class Plan extends Model {
  // static boot() {
  //   super.boot()

  /**
   * A hook to hash the user password before saving
   * it to the database.
   */
  // this.addHook('beforeSave', async (planInstance) => {
  // this.addHook('beforeCreate', async (planInstance) => {
  //   const max = 9999999
  //   const min = 1000000
  //   const random = Math.random() * (max - min) + min;
  //   console.log('random: ')
  //   console.log(Math.floor(random))

  //   // vefirique se o id ja existe
  //   // const planoIds = await Plans.all()
  //   // console.log(planoIds.toJSON())
  //   // atribua o id a chave primaria
  //   planInstance.id = Math.floor(random)

  //   // planInstance.id = uuidv4.v4()

  // })

  // }

  static get primaryKey() {
    return 'id'
  }

  static get incrementing() {
    return false
  }

  booking() {
    return this.hasMany('App/Models/Booking')
  }

}

module.exports = Plan
