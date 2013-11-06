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

});

describe('nodejs functions wrappers', function() {

});