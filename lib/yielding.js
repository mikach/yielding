(function () {

'use strict';

function isFunction(fn) {
    return fn instanceof Function;
}

Y.isPromise = function (obj) {
    return !!obj && isFunction(obj.then);
};

Y.isPromiseArray = function (arr) {
    return arr instanceof Array && arr.some(Y.isPromise);
};

Y.isGenerator = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Generator]';
};

Y.isGeneratorFn = function (fn) {
    return isFunction(fn) && fn.constructor.name === 'GeneratorFunction';
};

var AP = Array.prototype;

Y.ncall = function (fn) {
    fn = AP.shift.call(arguments);
    return Y.napply(fn, arguments);
};

Y.napply = function (fn, args) {
    var resolve, reject;

    AP.push.call(args, function (err, res) {
        !err ? resolve(res) : reject(err);
    });

    return {
        then: function (resolveFn, rejectFn) {
            resolve = resolveFn;
            reject = rejectFn;
            return fn.apply(this, args);
        }
    }
};

Y.nwrap = function (fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    
    return function () {
        return Y.napply(fn, args.concat( Array.prototype.slice.call(arguments) ));
    };
};

Y.all = function (arr) {
    if (!(arr instanceof Array)) {
        arr = AP.slice.call(arguments);
    }
    
    return {
        then: function (resolveFn, rejectFn) {
            for (var i = 0; i < arr.length; i++) {
                if (Y.isPromise(arr[i])) (function (i) {
                    arr[i].then(function(res) {
                        arr[i] = res;
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
    if (!Y.isGeneratorFn(fn)) {
        return fn;
    }

    var gen, ctx = this;

    function callNext(value) {
        if (!arguments.length) {
            value = resolve.value;
        }
        
        var next = gen.next(value);

        if (next.done) {
            return next.value;
        }

        if (Y.isPromise(next.value)) {
            return next.value.then(callNext, gen.throw.bind(gen));
        } else if (Y.isPromiseArray(next.value)) {
            return Y.all(next.value).then(callNext, gen.throw.bind(gen));
        } else {
            return callNext(next.value);
        }
    }

    function resolve() {
        if (!gen) {
            gen = fn.apply(ctx, arguments);
        }

        return callNext();
    }

    resolve.once = function() {
        if (!gen) {
            gen = fn.apply(ctx, arguments);
        }

        return resolve.value = gen.next(resolve.value).value;
    };

    resolve.toArray = function() {
        var values = [];

        for (var value of fn.apply(ctx, arguments)) {
            values.push(value);
        }

        return values;
    };

    return resolve;
};

module.exports = Y;

})();