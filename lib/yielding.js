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
Y.nwrap = function() {
    var args = Array.prototype.slice.call(arguments);
    return function() {
        var fn = args.shift();
        return Y.napply(fn,  args.concat( Array.prototype.slice.call(arguments) ));
    };
};



function Y(fn) { // TODO: errors handling
    var gen = null;
    function callNext(value) {
        var next = gen.next(value);
        if (!next.done) {
            return Y.isPromise(next.value) ? next.value.then(callNext) : callNext(next.value);
        }
        return next.value;
    };
    return Y.isGeneratorFn(fn) ? function() {
        gen = fn.apply(this, arguments);
        return callNext();
    } : fn;
};
