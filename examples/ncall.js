var Y = require('..');
var fs = require('fs');

Y.ncall(fs.readFile, './examples/Y.js', 'utf-8').then(function(content) {
    console.log(content.length);
});