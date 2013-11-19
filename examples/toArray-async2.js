var Y = require('..');
var q = require('q');
var fs = require('fs');

var getContent = function(filename) {
    var d = q.defer();
    console.log('start read file ' + filename);
    fs.readFile(filename, 'utf-8', function(err, res) {
        console.log('end read file ' + filename);
        if (!err) d.resolve(res);
        else d.reject(res);
    });
    return d.promise;
};


var getAll = Y(function* (files) {
    for (var i = 0; i < files.length; i++) {
        yield getContent(files[i]);
    }
});


Y(function* () {
    var files = ['examples/Y.js', 'examples/Y-async.js', 'examples/ncall.js'];
    var content = yield getAll.toArray(files);
    console.log(content.map(function(c) { return c.length })); // length of all files in array
})();