module.exports = Y;

Y.isGenerator = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Generator]';
};
Y.isGeneratorFn = function(fn) {
    return typeof fn === 'function' && fn.constructor.name === 'GeneratorFunction';
};
Y.isPromise = function(obj) {
    return obj && typeof obj.then === 'function';
};

function Y(fn) {
    var gen = null;
    function call(value) {
        var next = gen.next(value);
        console.log(next);
        if (!next.done) {
            return Y.isPromise(next.value) ? next.value.then(call) : call(next.value);
        }
        return next.value;
    };
    return Y.isGeneratorFn(fn) ? function() {
        gen = fn();
        return call();
    } : fn;
};
