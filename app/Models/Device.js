'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Device extends Model {
  property() {
    return this.hasMany('App/Models/Property')
  }
}

module.exports = Device
