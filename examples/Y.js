var Y = require('..');

// Sync example
var b = Y(function* () {
    var a = yield 1;
    var b = yield 2;
    return a + b;
});

console.log( b() ); // 3