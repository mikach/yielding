var Y = require('..');
var Q = require('q');

var asyncFn = function(n) {
    var delay = 1000 + Math.random()*2000;
    var d = Q.defer();
    console.log('function ' + n + ' started');
    setTimeout(function() {
        console.log('function ' + n + ' completed');
        d.resolve(n);
    }, delay);
    return d.promise;
};

Y(function* () {
    var a = yield [asyncFn(1),asyncFn(2),asyncFn(3), 4, 5];
    console.log(a); // 1,2,3,4,5
})();