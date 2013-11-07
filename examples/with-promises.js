var q = require('q');
var Y = require('..');

var asyncFn = function(str) {
    var d = q.defer();
    setTimeout(function() {
        d.resolve(str);
    }, 1000);
    return d.promise;
};

Y(function* () {
    console.log(yield asyncFn('Hello'));
    console.log(yield asyncFn('World')); // 1 second later
})();