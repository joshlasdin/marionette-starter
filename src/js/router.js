const bb = require('backbone');
const IndexRoute = require('./modules/index/route');
const AboutRoute = require('./modules/about/route');

module.exports = bb.Blazer.Router.extend({
    routes: {
        '': new IndexRoute(),
        'about': new AboutRoute(),
    },
});
