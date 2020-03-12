'use strict';

const Config = use('App/Models/Config');
const Blog = use('App/Models/Blog');
const User = use('App/Models/User');
const { validateAll } = use('Validator');
const Cloudinary = use('App/Services/Cloudinary');

class BlogController {
  async index({ view }) {
    const config = await Config.first();
    const listaPosts = await Blog.all();
    const lista = listaPosts.toJSON();

    const table = [];
    // eslint-disable-next-line no-plusplus
    for (let a = 0; a < lista.length; a++) {
      table[a] = {
        slug: lista[a].slug,
        title: lista[a].title,
        // eslint-disable-next-line no-await-in-loop
        author: (await User.find(lista[a].author_id)).toJSON(),
        conteudo: `${lista[a].content.substring(0, 40)}...`,
        lang: lista[a].lang,
      };
    }

    return view.render('post.index', {
      config,
      table,
    });
  }

  async novo({ view }) {
    const config = await Config.first();
    return view.render('post.novo', {
      config,
    });
  }

  async novoSave({ request, response, auth, session }) {
    const validation = await validateAll(request.all(), {
      lang: 'required',
      title: 'required',
      content: 'required',
    });

    if (validation.fails()) {
      session.withErrors(validation.messages());

      return response.redirect('back');
    }

    const Post = {
      title: request.input('title'),
      status: 0,
      content: request.input('content'),
      lang: request.input('lang'),
      author_id: auth.user.id,
    };

    const post = await Blog.create(Post);

    // return response.send(`/post/view/${post.slug}`);
    return response.redirect(`/post/view/${post.slug}`);
  }

  async view({ view, params }) {
    const config = await Config.first();
    const { id } = params;

    const post = await Blog.findBy('slug', id);

    if (!post) return view.render('404', { config });

    const Post = post.toJSON();

    return view.render('post.detalhes', {
      config,
      Post,
    });
  }

  async upload({ request, response, auth, params }) {
    const { id } = params;

    let post = null;
    request.multipart.file('capa', {}, async file => {
      // await Drive.disk('s3').put(file.clientName, file.stream)
      // send capa to cloudinary
      const capalink = await Cloudinary.sendUserIMGToCloudnary(
        file.stream,
        `site/posts/${auth.user.username}${new Date()}`
      );

      post = await Blog.find(id);
      if (!post) return response.redirect('404');
      post.capa = capalink;
      await post.save();
    });

    await request.multipart.process();

    // return response.send('capa foi enviado para o cloudinary');
    return response.redirect(`/post/view/${post.slug}`);
  }

  async update({ view, params }) {
    const config = await Config.first();
    const { id } = params;

    const post = await Blog.find(id);
    if (!post) return view.render('/404', { config });

    const lingua = {
      pt: 'Portugues',
      en: 'Ingles',
      fr: 'Frances',
    };

    return view.render('post.update', {
      config,
      Post: post.toJSON(),
      lingua,
    });
  }

  async updateSave({ request, response, session, params }) {
    const validation = await validateAll(request.all(), {
      title: 'required',
      content: 'required',
    });

    if (validation.fails()) {
      session.withErrors(validation.messages());

      return response.redirect('back');
    }

    const { id } = params;

    const post = await Blog.find(id);
    if (!post) return response.redirect('/404');
    post.title = request.input('title');
    post.content = request.input('content');
    await post.save();

    // return response.send('update post');
    return response.redirect(`/post/view/${post.slug}`);
  }

  async delete({ response, request, session, params }) {
    const validation = await validateAll(request.all(), {
      _csrf: 'required',
    });

    if (validation.fails()) {
      session.withErrors(validation.messages());

      return response.redirect('back');
    }

    const { id } = params;

    const post = await Blog.find(id);

    if (!post) return response.redirect('/404');

    await post.delete();

    // return response.send('deleted');
    return response.redirect('/post');
  }
}

module.exports = BlogController;
