'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Property extends Model {
    devices() {
        this.belongsTo('App/Models/Device')
    }
}

module.exports = Property
