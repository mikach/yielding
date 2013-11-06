var Y = require('..');
var q = require('q');
var fs = require('fs');
var expect = require('chai').expect;

var readFile = function(name) {
    var d = q.defer();
    fs.readFile(name, 'utf-8', function(err, res) {
        d.resolve(res);
    });
    return d.promise;
};

describe('detect promises and generators', function() {
    var gen = function* () {
        yield 1;
    };

    it('isPromise', function() {
        expect( Y.isPromise(readFile('test')) ).to.be.true;
        expect( Y.isPromise(q.defer().promise) ).to.be.true;
        expect( Y.isPromise() ).to.be.false;
    });

    it('isGenerator', function() {
        expect( Y.isGenerator(gen) ).to.be.false;
        expect( Y.isGenerator(gen()) ).to.be.true;
    });

    it('isGeneratorFn', function() {
        expect( Y.isGeneratorFn(gen) ).to.be.true;
        expect( Y.isGeneratorFn(readFile) ).to.be.false;
    });
});

describe('Y function', function() {
    var gen = function* () {
        for (var i = 0; ++i < 10;)
            yield i;
        return i;
    };

    it('should return function', function() {
        var b = Y(gen);
        expect(b).to.be.a('function');
    });

    it('should return self if function is not a generator', function() {
        var emptyFn = function() {};
        expect( Y(emptyFn) ).to.be.equal( emptyFn );
    });

    it('should return value', function() {
        expect( Y(gen)() ).to.be.equal( 10 );
    });

    it('once()', function() {

    });
});

describe('nodejs functions wrappers', function() {
    describe('nwrap()', function() {
        var read = Y.nwrap(fs.readFile);
        it('return promise', function() {
            expect( Y.isPromise(read()) ).to.be.true;
        });
        it('read a file', function(done) {
            read('test/example.txt', 'utf-8').then(function(content) {
                expect('content').to.be.a('string');
                done();
            });
        });
    });
});