module.exports = Y;


Y.isPromise = function(obj) {
    return !!obj && typeof obj.then === 'function';
};

Y.isGenerator = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Generator]';
};

Y.isGeneratorFn = function(fn) {
    return typeof fn === 'function' && fn.constructor.name === 'GeneratorFunction';
};


Y.ncall = function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return Y.napply(fn, args);
};

Y.napply = function(fn, args) { // TODO: reject
    var callback;
    args.push(function(err, res) {
        if (!err) callback(res);
    });
    return {
        then: function(resolve, reject) {
            callback = resolve;
            fn.apply(this, args);
        }
    }
};

Y.nwrap = function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
        return Y.napply(fn,  args.concat( Array.prototype.slice.call(arguments) ));
    };
};


function Y(fn) { // TODO: errors handling
    'use strict';
    
    var gen, ctx = this;

    function callNext(value) {
        value = value || resolve.value;
        var next = gen.next(value);
        if (!next.done) {
            return Y.isPromise(next.value) ? next.value.then(callNext) : callNext(next.value);
        }
        return next.value;
    }

    function resolve() {
        if (!gen) gen = fn.apply(ctx, arguments);
        return callNext();
    }

    resolve.once = function() {
        if (!gen) gen = fn.apply(ctx, arguments);
        resolve.value = gen.next(resolve.value).value;
        return resolve.value;
    };

    resolve.toArray = function() {
        if (!gen) gen = fn.apply(ctx, arguments);
        var values = [], next = gen.next();
        while (!next.done) {
            values.push(next.value);
            next = gen.next(next.value);
        }
        return values;
    };

    return Y.isGeneratorFn(fn) ? resolve : fn;
};
