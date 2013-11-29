var Y = require('..');
var get = Y.nwrap( require('request').get );

Y(function* () {
    var pages = ['http://google.com', 'http://yahoo.com', 'http://bing.com'];
    var content = yield pages.map(function(url) {
        return get(url);
    });
    console.log(content.map(function(c) { return c.body.length; }));
})();