'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Blog extends Model {
  static boot() {
    super.boot();

    this.addTrait('@provider:Lucid/Slugify', {
      fields: {
        slug: 'title',
      },
      strategy: 'dbIncrement',
    });
  }

  user() {
    return this.belongsTo('App/Models/User');
  }
}

module.exports = Blog;
