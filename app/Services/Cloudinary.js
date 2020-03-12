const Env = use('Env');
const Book = use('App/Models/Booking');
const qr = require('qr-image');
const cloudinary = require('cloudinary').v2;
// enviar para o cloudinary
cloudinary.config({
  // configuraçoes do cloudinary
  cloud_name: Env.get('CloudName'),
  api_key: Env.get('CloudKey'),
  api_secret: Env.get('CloudSecret'),
});

class Cloudinary {
  // const caminho = 'resources/uploads/'+auth.user.username+'_'+new Date()+'.png'
  // const content = Env.get('BACK_URL')+'/reservas/info/'+books.id

  constructor() {
    this.opcao = {
      tags: ['wifianywhere', 'qrcode', 'iMedia'],
      // folder: 'qrcode',
      type: 'authenticated', // para que a url nao seja compartilhada
    };
  }

  static async sendQRcodeToCloudinary(content, auth, bookid, session) {
    //generate qrcode
    const qr_svg = qr.image(content, {
      type: 'png',
    }); // gerar o qrcode
    // qr_svg.pipe(require('fs').createWriteStream(caminho))

    try {
      const Upload = await new Promise((resolve, reject) => {
        qr_svg.pipe(
          cloudinary.uploader.upload_stream(
            {
              ...this.opcao,
              public_id: 'qrcode/' + auth.user.username + '_' + new Date(),
            },
            (err, res) => {
              if (err) reject(err);
              resolve(res);
            }
          )
        );
      });

      console.log();
      console.log('** File Upload (Promise)');
      console.log("* image data is generated by Cloudinary's service.");
      console.log('* ' + Upload.public_id);
      console.log('* ' + Upload.url);
      console.log('* ' + Upload.secure_url);

      // add qrcode to booking table
      const atualizabooks = await Book.find(bookid); // estava bookid e troquei pelo
      atualizabooks.qrcode = Upload.secure_url;
      const ok = await atualizabooks.save();
      if (!ok) {
        session.flash({
          bookcloudnary: 'Error on qrcode saving',
        });
      }

      return Upload.secure_url;
    } catch (error) {
      console.log();
      console.log('** File Upload (Promise error)');
      console.warn(error);
    }
  }

  static async sendUserIMGToCloudnary(profilePic, imageName) {
    try {
      console.log(profilePic);
      // // const fileStream = fs.createReadStream(profilePic)
      // const { stream } = await profilePic

      const Upload = await new Promise((resolve, reject) => {
        profilePic.pipe(
          cloudinary.uploader.upload_stream(
            {
              ...this.opcao,
              public_id: imageName,
            },
            (err, res) => {
              if (err) reject(err);
              resolve(res);
            }
          )
        );
      });
      // const Upload = await cloudinary.uploader.upload(profilePic, this.opcao)

      console.log();
      console.log('** File Upload (Promise)');
      console.log("* image data is generated by Cloudinary's service.");
      console.log('* ' + Upload.public_id);
      console.log('* ' + Upload.url);
      console.log('* ' + Upload.secure_url);

      const image = {
        public_id: Upload.public_id,
        secure_url: Upload.secure_url,
      };

      return image;
    } catch (error) {
      console.log();
      console.log('** File Upload (Promise error)');
      console.warn(error);
    }
  }

  // cloudinary.v2.api.delete_resources(public_ids, options, callback);
  static async deleteUserIMGFromCloudinary(publicId) {
    // site/posts/h7Xn@qsdsh_jhklhkjThu Mar 12 2020 11:22:37 GMT-0100 (Cape Verde Standard Time)
    const deleted = cloudinary.uploader.destroy(publicId, { invalidate: true });

    return deleted;
  }
}

module.exports = Cloudinary;

/**
//  * gerar QRcode e enviar para o cloudnary
//  */
// let cloudImage = null
// const caminho = 'resources/uploads/'+auth.user.username+'_'+new Date()+'.png'
// const content = Env.get('BACK_URL')+'/reservas/info/'+books.id

// var qr_svg = qr.image(content, { type: 'png' })// gerar o qrcode
// qr_svg.pipe(require('fs').createWriteStream(caminho))// guardar em resources/uploads/
// // var svg_string = qr.imageSync('http://192.168.88.42:3000', { type: 'png' })
// // console.log(qr_svg)

// // enviar para o cloudinary
// cloudinary.config({ //configuraçoes do cloudinary
//     cloud_name: Env.get('CloudName'),
//     api_key: Env.get('CloudKey'),
//     api_secret: Env.get('CloudSecret')
// });
// // File upload (example for promise api)
// const opcao = {
//     tags: ['wifianywhere', 'qrcode', 'iMedia'],
//     folder: 'qrcode',
//     type: "authenticated"//para que a url nao seja compartilhada
// }

// let ImageLink = null
// try {
//     console.log('Upload: ')

//     const Upload = await cloudinary.uploader.upload(caminho, opcao)
//     const Upload = await cloudinary.uploader.upload_stream(caminho, opcao)
//     console.log(Upload)

//     if(Upload){
//         console.log()
//         console.log("** File Upload (Promise)")
//         console.log("* image data is generated by Cloudinary's service.")
//         console.log("* " + Upload.public_id)
//         console.log("* " + Upload.url)
//         console.log("* " + Upload.secure_url)

//         // eliminar o qr code do servidor
//         fs.unlink(caminho, (err) => {
//             if (err) throw err;
//             console.log(`${caminho} was deleted`);
//         });
//         ImageLink = Upload.secure_url
//     }
// } catch (error) {
//     console.log()
//     console.log("** File Upload (Promise)")
//     console.warn(error)
// }

// // add qrcode to booking table
// const atualizabooks = await Book.find(books.id)//estava bookid e troquei pelo
// atualizabooks.qrcode = ImageLink
// const ok = await atualizabooks.save()
