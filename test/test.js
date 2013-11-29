var Y = require('..');
var q = require('q');
var fs = require('fs');
var expect = require('chai').expect;

var readFile = function (name) {
    var d = q.defer();
    fs.readFile(name, 'utf-8', function (err, res) {
        d.resolve(res);
    });
    return d.promise;
};

describe('detect promises and generators', function () {
    var gen = function* () {
        yield 1;
    };

    it('isPromise', function () {
        expect( Y.isPromise(readFile('test')) ).to.be.true;
        expect( Y.isPromise(q.defer().promise) ).to.be.true;
        expect( Y.isPromise() ).to.be.false;
    });

    it('isPromiseArray', function () {
        expect( Y.isPromiseArray([1,2,3]) ).to.be.false;
        expect( Y.isPromiseArray('test') ).to.be.false;
        expect( Y.isPromiseArray([1,2,q.defer().promise]) ).to.be.true;
    });

    it('isGenerator', function () {
        expect( Y.isGenerator(gen) ).to.be.false;
        expect( Y.isGenerator(gen()) ).to.be.true;
    });

    it('isGeneratorFn', function () {
        expect( Y.isGeneratorFn(gen) ).to.be.true;
        expect( Y.isGeneratorFn(readFile) ).to.be.false;
    });
});

describe('Y function', function () {
    var gen = function* () {
        for (var i = 0; ++i < 10;) {
            yield i;
        }
        return i;
    };

    it('should return function', function () {
        var b = Y(gen);
        expect(b).to.be.a('function');
    });

    it('should return self if function is not a generator', function () {
        var emptyFn = function () {};
        expect( Y(emptyFn) ).to.be.equal( emptyFn );
    });

    it('should return value', function () {
        expect( Y(gen)() ).to.be.equal( 10 );
    });

    it('once()', function () {
        var b = Y(gen);
        expect( b.once() ).to.be.equal( 1 );
        expect( b.once() ).to.be.equal( 2 );
        expect( b() ).to.be.equal( 10 );
    });

    it('toArray() Sync', function () {
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

    it('toArray() Async', function(done) {
        var getContent = Y.nwrap(fs.readFile);
        var getAll = Y(function* (files) {
            for (var i = 0; i < files.length; i++) {
                yield getContent(files[i], 'utf8');
            }
        });
        Y(function* () {
            var files = ['examples/Y.js', 'examples/Y-async.js', 'examples/ncall.js'];
            var content = yield getAll.toArray(files);
            content.forEach(function(c) { 
                expect(c).to.be.a('string');
                expect(c.length > 0).to.be.true;
            });
            done();
        })();
    });

    it('parallel execution', function(done) {
        var get = Y.nwrap( require('request').get );
        Y(function* () {
            var pages = ['http://google.com', 'http://yahoo.com'];
            var content = yield pages.map(function(url) {
                return get(url);
            });
            content.forEach(function(c) { 
                expect(c.body).to.be.a('string');
                expect(c.body.length > 0).to.be.true;
            })
            done();
        })();
    });
});

describe('nodejs functions wrappers', function () {
    describe('nwrap()', function () {
        var filename = 'test/example.txt';
        var read = Y.nwrap(fs.readFile);
        var readWithParams = Y.nwrap(fs.readFile, filename, 'utf-8');

        it('return promise', function () {
            expect( Y.isPromise(read()) ).to.be.true;
            expect( Y.isPromise(readWithParams()) ).to.be.true;
        });

        it('read a file', function (done) {
            read(filename, 'utf-8').then(function (content) {
                expect(content).to.be.equal('Hello');
                done();
            });
        });

        it('read a file with params', function (done) {
            readWithParams().then(function (content) {
                expect(content).to.be.a('string');
                done();
            });
        });
    });
});

describe('async functions w/o wrapping in Y async scope', function () {
    it('read a file', function (done) {
        Y(function *async() {
            var content = yield fs.readFile('test/example.txt', 'utf-8', async.resume);
            expect(content).to.be.equal('Hello');
            done();
        })();
    });

    it('non-explicitly async function', function (done) {
        Y(function *async() {
            // void operator is needed since setTimeout returns !== undefined and Y thinks it's ready-to-use value
            var result = yield void setTimeout(function () {
                async.resume(null, 123);
            }, 200);
            expect(result).to.be.equal(123);
            done();
        })();
    });

    it('treat node error as exception', function (done) {
        Y(function *async() {
            try {
                expect(yield fs.readFile('non_exists_file', 'utf-8', async.resume)).to.be.undefined;
            } catch (e) {
                expect(e).to.be.instanceof(Error);
            } finally {
                done();
            }
        })();
    });
});

describe('errors handling', function () {
    it('should handle errors in promises', function (done) {
        var b = Y(function* () {
            var ex;
            try {
                expect(yield Q.nfcall(fs.readFile, 'non_exists_file', 'utf-8')).to.be.undefined;
            } catch (e) {
                expect(e).to.be.instanceof(Error);
            } finally {
                done();
            }
        })();
    });
});