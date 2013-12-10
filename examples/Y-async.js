var fs = require('fs');
var Y = require('..');

var read = Y.nwrap(fs.readFile);

function* getContent(filename) {
    var content = yield read(filename, 'utf8');
    console.log(content.length);
};

Y(getContent)('./examples/Y.js');