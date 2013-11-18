var Y = require('..');

var odd = Y(function* (limit) {
    for (var i = 0; i < limit; i++) {
        if (i % 2) yield i;
    }
});

console.log( odd.toArray(10) );