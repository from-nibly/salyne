var Salyne = require('../index.js'),
  assert = require('chai').assert;

describe('inject', function() {
  var injector;
  beforeEach(function() {
    injector = new Salyne();
  });

  it('should inject a function using signature', function() {
    var ctor = function literal() {
      this.test = 5;
    };
    injector.bind(ctor);
    injector.inject(function(literal) {
      var expected = new ctor();
      assert.deepEqual(expected, literal);
    });
  });

  it('should inject using require option', function() {
    var ctor = function literal() {
      this.test = 5;
    };
    injector.bind(ctor);
    injector.inject(function(actual) {
      var expected = new ctor();
      assert.deepEqual(expected, actual);
    }, { require : ['literal'] });
  });

  it('should inject using requires option', function() {
    var ctor = function literal() {
      this.test = 5;
    };
    injector.bind(ctor);
    injector.inject(function(actual) {
      var expected = new ctor();
      assert.deepEqual(expected, actual);
    }, { requires : ['literal'] });
  });

  it('should inject dependency with dependency', function() {
    var ctor = function literal(foobar) {
      this.test = 5;
      this.foobar = foobar;
    };
    var foobar = function foobar() {
      this.testing = 6;
    };
    injector.bind(ctor);
    injector.bind(foobar);

    injector.inject(function(actual) {
      var expected = new ctor(new foobar());
      assert.deepEqual(expected, actual);
    }, { requires : ['literal'] });
  });

  it('should inject multiple dependencies', function() {
    var ctor = function literal() {
      this.test = 5;
    };
    var foobar = function foobar() {
      this.testing = 6;
    };
    injector.bind(ctor);
    injector.bind(foobar);
    injector.inject(function(actual, actFoo) {
      var expected = new ctor();
      var expFoobar = new foobar();
      assert.deepEqual(expected, actual);
      assert.deepEqual(expFoobar, actFoo);
    }, { requires : ['literal', 'foobar'] });
  });

});
