'use strict'

// trazer o model
const Post = use('App/Models/Post')
// trazer o validator
const { validate } = use('Validator')


class PostController {
    async index({ view }) {
        const posts = await Post.all()

        return view.render('posts.index', {
            title: 'Meus Ultimos Posts',
            Post: posts.toJSON()
        })
    }
    
    async details({ params, view }) {
        const post = await Post.find(params.id)

        return view.render('posts.details', {
            Post: post
        })
    }

    async add({ view }){
        return view.render('posts.add')
    }

    async store({request, response, session}){

        // validate input
        const validation = await validate(request.all(), {
            title: 'required|min:3|max:255',
            body: 'required|min:3'
        })
        // send validation messages
        if(validation.fails()){
            session.withErrors(validation.messages()).flashAll()
            return response.redirect('back')
        }

        const post = new Post()

        post.title = request.input('title')
        post.body = request.input('body')

        await post.save()

        session.flash({ notification: 'Post added com sucesso!'})

        return response.redirect('/posts')
    }

    async edit({ params, view }){
        const post = await Post.find(params.id)
        console.log(params.id)


        return view.render('posts.edit', {
            post: post
        })
    }

    async update({params, request, response, session}){
        // validate input
        const validation = await validate(request.all(), {
            title: 'required|min:3|max:255',
            body: 'required|min:3'
        })
        // send validation messages
        if(validation.fails()){
            session.withErrors(validation.messages()).flashAll()
            return response.redirect('back')
        }

        const post = await Post.find(params.id)

        post.title = request.input('title')
        post.body = request.input('body')

        await post.save()

        session.flash({notification: 'Post updated'})

        return response.redirect('/posts')
    }

    async destroy({params, session, response}){
        const post = await Post.find(params.id)

        await post.delete()

        session.flash({notification: 'post deleted!'})

        return response.redirect('/posts')
    }
}

module.exports = PostController
