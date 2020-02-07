'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const uuidv4 = require('uuid/v4');
const Database = use('Database');

class Booking extends Model {
  static boot() {
    super.boot();

    /**
     * A hook to create booking uuid before saving
     * it to the database.
     */
    // this.addHook('beforeSave', async (userInstance) => { //esta 1 bug aqui, ele faz hash 2x
    this.addHook('beforeCreate', payInstance => {
      console.log('criando o uuid');
      payInstance.id = uuidv4.v4();
    });
  }

  plans() {
    return this.belongsTo('App/Models/Plan', 'plano_id');
  }

  devices() {
    return this.belongsTo('App/Models/Device');
  }

  payments() {
    return this.hasMany('App/Models/Payment');
  }

  static get incrementing() {
    return false;
  }
}

module.exports = Booking;
