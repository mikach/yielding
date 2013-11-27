(function (factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        this.Y = factory();
  }
})(function () {

'use strict';

var ArrayProto = Array.prototype, ObjProto = Object.prototype;

var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    shift            = ArrayProto.shift,
    toString         = ObjProto.toString;



Y.VERSION = '0.1.9';



Y.isFunction = function(fn) {
    return fn instanceof Function;
};

Y.isPromise = function (obj) {
    return !!obj && Y.isFunction(obj.then);
};

Y.isPromiseArray = function (arr) {
    return arr instanceof Array && arr.some(Y.isPromise);
};

Y.isGenerator = function (obj) {
    return toString.call(obj) === '[object Generator]';
};

Y.isGeneratorFn = function (fn) {
    return Y.isFunction(fn) && fn.constructor.name === 'GeneratorFunction';
};




Y.ncall = function (fn) {
    fn = shift.call(arguments);
    return Y.napply(fn, arguments);
};

Y.napply = function (fn, args) {
    var resolve, reject;

    push.call(args, function (err, res) {
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
    var args = slice.call(arguments, 1);
    
    return function () {
        return Y.napply(fn, args.concat( slice.call(arguments) ));
    };
};



Y.all = function (arr) {
    if (!(arr instanceof Array)) {
        arr = slice.call(arguments);
    }
    
    return {
        then: function (resolveFn, rejectFn) {
            arr.forEach(function (promise, i, arr) {
                if (!Y.isPromise(promise)) return;

                promise.then(function(res) {
                    arr[i] = res;
                    if (!Y.isPromiseArray(arr)) {
                        resolveFn(arr);
                    }
                }, rejectFn);
            });
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
            return next.value !== undefined ? callNext(next.value) : next.value;
        }
    }

    fn.resume = function (err, res) {
        err ? gen.throw(err) : callNext(res);
    };

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
}


return Y;

});
