yielding
========
Easy generators.

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
### Async code:
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
### Wrap node functions
```js
var read = Y.nwrap(fs.readFile);

function* getContent(filename) {
    var content = yield read(filename, 'utf-8');
    console.log(content.length);
};

Y(getContent)('./examples/Y.js');
```
