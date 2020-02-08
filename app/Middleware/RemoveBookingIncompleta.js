// 'use strict'
/* global use */
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Book = use('App/Models/Booking');
// const Pay = use('App/Models/Payment');

class RemoveBookingIncompleta {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle({ request, auth }, next) {
    // let a = null
    try {
      await auth.check();

      // const booki = await Book
      //   .query()
      //   .whereNotNull('check')
      //   .where('user_id', auth.user.id)
      //   .fetch()
      // const books = booki.toJSON()

      // console.log(books)

      // for(let i=0;i>books.lenght;i++){
      //   const pay = await Pay
      //   .query()
      //   .where('booking_id', books[i].id)
      //   // .fetch()
      //   .delete()
      //   console.log('payments incompletos: '+pay)
      // }

      // const book =
      const ok = await Book.query()
        .whereNotNull('check')
        .where('createdBy', auth.user.username)
        // .fetch()
        .delete();

      // console.log('Book incompletos: ' + book);

      await next();
    } catch (error) {
      await next();
    }
  }
}

module.exports = RemoveBookingIncompleta;
