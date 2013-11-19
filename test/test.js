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

    it('isPromiseArray', function() {
        expect( Y.isPromiseArray([1,2,3]) ).to.be.false;
        expect( Y.isPromiseArray('test') ).to.be.false;
        expect( Y.isPromiseArray([1,2,q.defer().promise]) ).to.be.true;
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
        var b = Y(gen);
        expect( b.once() ).to.be.equal( 1 );
        expect( b.once() ).to.be.equal( 2 );
        expect( b() ).to.be.equal( 10 );
    });

    it('toArray() Sync', function() {
        var b = Y(function* (limit) {
            for (var i = 0; i < limit; i++) {
                if (i % 3 === 0) yield i;
            }
        });
        expect( b.toArray(10) ).to.have.length(4);
        expect( b.toArray(16) ).to.have.length(6);
        expect( b.toArray(20).toString() ).to.be.equal( [0, 3, 6, 9, 12, 15, 18].toString() );
        expect( b.toArray(4)[1] ).to.be.equal(3);
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

describe('errors handling', function() {
    it('should handle errors in promises', function(done) {
        var b = Y(function* () {
            var ex;
            try {
                var content = yield Q.nfcall(fs.readFile, 'non_exists_file', 'utf-8');
            } catch(e) {
                ex = e;
            }
            expect(ex instanceof Error).to.be.ok;
            expect(ex.message).to.be.a('string');
            done();
        })();
    });
});