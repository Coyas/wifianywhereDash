/* eslint-disable no-plusplus */
'use strict';
const Config = use('App/Models/Config');
const { validateAll } = use('Validator');
const Utils = use('App/Services/Utils');
const User = use('App/Models/User');
const Siteimage = use('App/Models/Siteimage');
const Cloudinary = use('App/Services/Cloudinary');

class WebsiteController {
  async index({ view }) {
    const config = await Config.first();
    const siteimage = await Siteimage.all();
    const siteimages = siteimage.toJSON();

    const Website = [];
    if (siteimages.length > 0) {
      for (let i = 0; i < siteimages.length; i++) {
        Website[i] = {
          id: siteimages[i].id,
          title: siteimages[i].nome,
          image: siteimages[i].image,
        };
      }
    }

    return view.render('website.index', {
      config,
      Website,
    });
  }

  async banners({ view, params }) {
    const { pasta } = params;
    console.log(pasta);
    return view.render('website.banners', {
      pasta,
    });
  }

  // auth.user.username + '_' + new Date()
  async upload({ request, response, auth, session, params }) {
    const { pasta } = params;

    console.log('pasta');
    console.log(pasta);
    let cloudPasta = null;
    if (pasta === 1) {
      cloudPasta = 'site/pages/';
    }

    const imageName = `${cloudPasta}${auth.user.username}${new Date()}`;

    request.multipart.file('profile_pic', {}, async file => {
      const Upload = await Cloudinary.sendUserIMGToCloudnary(
        file.stream,
        auth,
        session,
        imageName
      );

      // add image to table Siteimage
      const a = Upload;
    });

    await request.multipart.process();

    return response.redirect('back');
  }
}

module.exports = WebsiteController;
