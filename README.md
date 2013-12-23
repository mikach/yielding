#yielding [![NPM version][npm-image]][npm-url] [![Build Status](https://travis-ci.org/mikach/yielding.png?branch=master)](https://travis-ci.org/mikach/yielding)
> Easy generators.

Use Node version 0.11.x with `--harmony-generators` flag to work with es6 generators.
### Installation
```
npm install yielding
```
### Y()
```js
var Y = require('yielding');

var c = Y(function* () {
    var a = yield 1;
    var b = yield 2;
    return a + b;
});

console.log( c.once() ); // 1
console.log( c() ); // 3
```
### Y.toArray()
```js
var odd = Y(function* (limit) {
    for (var i = 0; i < limit; i++) {
        if (i % 2) yield i;
    }
});

console.log( odd.toArray(10) ); // 1,3,5,7,9
```
### Parallel execution
```js
var get = Y.nwrap( require('request').get );

Y(function* () {
    var pages = ['http://google.com', 'http://yahoo.com', 'http://bing.com'];
    var content = yield pages.map(function(url) {
        return get(url);
    });
    console.log(content.map(function(c) { return c.body.length; }));
})();
```
### Async code with wrapper for node functions
```js
var read = Y.nwrap(fs.readFile);

function* getContent(filename) {
    var content = yield read(filename, 'utf-8');
    console.log(content.length);
};

Y(getContent)('./examples/Y.js');
```
### With promises
```js
var q = require('q');

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
```
### Creating promises
```js
Y.ncall(fs.readFile, './examples/Y.js', 'utf-8').then(function(content) {
    console.log(content.length);
});
```
###Errors handling
```js
Y(function* () {
    try { 
      var content = yield Y.ncall(fs.readFile, 'non_exists_file', 'utf-8');
    } catch(e) {
      console.log('ERROR: ' + e.message);
    }
    console.log('done');
})();
```
###SUSPEND-style
```js
Y(function *async() {
    var content = yield fs.readFile('test/example.txt', 'utf8', async.resume);
})();
```
[See more examples](https://github.com/mikach/yielding/tree/master/examples)

[npm-url]: https://npmjs.org/package/yielding
[npm-image]: https://badge.fury.io/js/yielding.png
