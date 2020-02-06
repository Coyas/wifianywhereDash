/*  global use */
/**
 * Utilidades
 *
 */

const Hash = use('Hash');
// const moment = use('moment');
const Encryption = use('Encryption');
const Env = use('Env');
const Social = use('App/Models/Rsocial');
const Contact = use('App/Models/Wifianywhere');
// const Crypto = use('crypto');
const axios = require('axios');

class Utils {
  static async googleRecaptcha(request, session) {
    // validar google recaptcha
    // console.log('G_recaptcha: ')
    // console.log(request.input('g-recaptcha-response'))

    const google = await axios({
      method: 'post',
      url: 'https://www.google.com/recaptcha/api/siteverify',
      params: {
        secret: Env.get('G_secretu'),
        response: request.input('g-recaptcha-response'),
      },
    });

    if (!google.data.success && google.data.score < 0.6) {
      return false;
    }

    // if (google.data.success && google.data.score > 0.6) {
    //   console.log('Login: voce é humano');
    //   console.log(google.data.success);
    //   console.log(google.data.score);
    // } else {
    //   console.log('Login: voce nao é humano');
    //   console.log(google.data.success);
    //   console.log(google.data.score);
    session.flash({
      notification: {
        type: 'danger',
        message: 'google recaptcha Fail, try again',
      },
    });

    return true;
  }

  /* TODO: corrigir para situação onde instagram vem antes do facebook */
  static async getFooterData() {
    let res = await Social.query()
      .where({ nome: 'facebook' })
      .orWhere({ nome: 'instagram' })
      .fetch();

    res = res.toJSON().map(i => {
      return { nome: i.nome, link: i.link, icon: i.icon };
    });

    // console.log('res');
    // console.log(res);

    return {
      contato: (await Contact.first()).toJSON(),
      Rsocial: res,
      face: res[0],
      insta: res[1],
    };
  }

  static getLocales(antl) {
    return antl.availableLocales().filter(i => i !== antl.currentLocale());
  }

  static async generateHash(auth) {
    return await Hash.make(
      auth.user ? auth.user.id : '000000' + 'wifianywhere'
    );
  }

  static async verificarHash(hash, auth) {
    return await Hash.verify(
      auth.user ? auth.user.id : '000000' + 'wifianywhere',
      hash
    );
  }

  static criptografarHash(hash) {
    console.log('encrypt url');
    return Encryption.encrypt(hash);
  }

  static decriptografarHash(criptohash) {
    console.log('decrypt url');
    const a = Encryption.decrypt(criptohash);
    return a;
  }

  static async generateCheck(auth) {
    const hash = await this.generateHash(auth);
    console.log('generate Hash');
    console.log(hash);
    let criptoHash = await this.criptografarHash(hash);
    console.log('generate criptoHash');
    console.log(criptoHash);
    // se houver um '/' no hash substitui pelo '0!0'
    console.log('replace / por 0!0');
    console.log('uri encode: ' + criptoHash);

    criptoHash = encodeURIComponent(criptoHash);

    return criptoHash; // .replace(/\//g, '0!0');
  }

  static async verificarCheck(check, auth) {
    console.log('pegar check');
    console.log(check);
    // console.log('replace 0!0 por /');
    // let criptohash = check.replace(/0!0/g, '/');
    // console.log('pegar criptoHash');
    // console.log(criptohash);
    console.log('decriptografar criptohash');

    const criptohash = decodeURIComponent(check);

    const decriptohash = this.decriptografarHash(criptohash);
    console.log('pegar decriptohash');
    console.log(decriptohash);
    console.log('send decriptohash boolean value');
    return this.verificarHash(decriptohash, auth);
  }
}

module.exports = Utils;
