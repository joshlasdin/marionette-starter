const bb = require('backbone');
const IndexRoute = require('./modules/index/route');
const AboutRoute = require('./modules/about/route');
const PostsRoute = require('./modules/posts/route');
const PostRoute = require('./modules/post/route');

module.exports = bb.Blazer.Router.extend({
    routes: {
        '': new IndexRoute(),
        'about/': new AboutRoute(),
        'posts/': new PostsRoute(),
        'posts/:id/': new PostRoute(),
    },
});
