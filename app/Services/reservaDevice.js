/* global use */
const Database = use('Database');

class reservaDevice {
  static async getDeviceLivres() {
    let livres = [];
    livres = await Database.table('deviceLivre').select('*');
    // console.log('livres');
    // console.log(livres);

    if (livres.length <= 0) {
      console.log('livres <= 0');
      return false;
    }

    console.log('livres');
    console.log(livres[0].id);
    return livres[0].id;
  }
}

module.exports = reservaDevice;
