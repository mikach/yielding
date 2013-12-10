var fs = require('fs');
var Y = require('..');
var Q = require('q');


Y(function* () {
    try { 
      var content = yield Y.ncall(fs.readFile, 'non_exists_file', 'utf8');
    } catch(e) {
      console.log('ERROR: ' + e.message);
    }
    console.log('done');
})();