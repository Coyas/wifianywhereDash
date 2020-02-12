'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Category extends Model {
  faqs() {
    return this.belongsToMany('App/Models/Faq').pivotTable('category_faq');
  }
}

module.exports = Category;
