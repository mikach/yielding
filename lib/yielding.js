module.exports = Y;


Y.isPromise = function(obj) {
    return !!obj && typeof obj.then === 'function';
};

Y.isPromiseArray = function(arr) {
    return arr instanceof Array && arr.filter(function(elem) { return Y.isPromise(elem); }).length > 0;
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

Y.napply = function(fn, args) {
    var resolve, reject;
    args.push(function(err, res) {
        if (!err) resolve(res); 
        else reject(err);
    });
    return {
        then: function(resolveFn, rejectFn) {
            resolve = resolveFn;
            reject = rejectFn;
            return fn.apply(this, args);
        }
    }
};

Y.nwrap = function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
        return Y.napply(fn,  args.concat( Array.prototype.slice.call(arguments) ));
    };
};

Y.all = function(arr) {
    if ( !(arr instanceof Array) )
        arr = Array.prototype.slice.call(arguments);
    
    return {
        then: function(resolveFn, rejectFn) {
            for (var i = 0; i < arr.length; i++) {
                if (Y.isPromise(arr[i])) (function(index) {
                    arr[index].then(function(res) {
                        arr[index] = res;
                        if (!Y.isPromiseArray(arr)) {
                            resolveFn(arr);
                        }
                    }, rejectFn);
                })(i);
            }
        }
    };
};


function Y(fn) {
    'use strict';

    var gen, ctx = this;

    function callNext(value) {
        value = value || resolve.value;
        var next = gen.next(value);
        if (next.done) return next.value;
        if (Y.isPromise(next.value)) {
            return next.value.then(callNext, gen.throw.bind(gen));
        } else if (Y.isPromiseArray(next.value)) {
            return Y.all(next.value).then(callNext, gen.throw.bind(gen));
        } else {
            return callNext(next.value);
        }
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
        var arrayGen = fn.apply(ctx, arguments);
        var values = [], next = arrayGen.next();
        while (!next.done) {
            values.push(next.value);
            next = arrayGen.next(next.value);
        }
        return values;
    };

    return Y.isGeneratorFn(fn) ? resolve : fn;
};
