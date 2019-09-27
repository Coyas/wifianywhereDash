'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Place extends Model {
    picklocation() {
        return this.hasMany('App/Models/Booking')
    }
    
    returnlocation() {
        return this.hasMany('App/Models/Booking')
    }
}

module.exports = Place
