var Salyne = require('../index.js'),
  assert = require('chai').assert;

describe('bind', function() {
  var injector;
  beforeEach(function() {
    injector = new Salyne();
  });

  it('should take a literal constructor with a function', function() {
    var ctor = function literal() {
      this.test = 5;
    };
    injector.bind(ctor);
    var actual = injector.create('literal');
    var expected = new ctor();
    assert.deepEqual(expected, actual);
  });
  it('should take a literal constructor with a name param', function() {
    var ctor = function() {
      this.test = 5;
    };
    injector.bind(ctor, 'literal');
    var actual = injector.create('literal');
    var expected = new ctor();
    assert.deepEqual(expected, actual);
  });
  it('should take a literal constructor with a name option', function() {
    var ctor = function() {
      this.test = 5;
    };
    injector.bind(ctor, { name : 'literal'});
    var actual = injector.create('literal');
    var expected = new ctor();
    assert.deepEqual(expected, actual);
  });
  it('should return the same instance for a singleton with property', function() {
    var count = 0;
    var ctor = function() {
      this.test = count++;
    };
    ctor.singleton = true;
    injector.bind(ctor, { name : 'literal'});
    var actual = injector.create('literal');
    var expected = injector.create('literal');
    assert.deepEqual(expected, actual);
  });
  it('should return the same instance for a singleton with option', function() {
    var count = 0;
    var ctor = function() {
      this.test = count++;
    };
    injector.bind(ctor, { name : 'literal', singleton : true});
    var actual = injector.create('literal');
    var expected = injector.create('literal');
    assert.deepEqual(expected, actual);
  });
  it('should return the same instance for a singleton with annotation', function() {
    var count = 0;
    var ctor = function() {
      this.test = count++;
    };
    ctor['@singleton'] = true;
    injector.bind(ctor, { name : 'literal' });
    var actual = injector.create('literal');
    var expected = injector.create('literal');
    assert.deepEqual(expected, actual);
  });
  it('should throw without a function', function() {
    assert.throw(function() {
      injector.bind('foobar');
    }, 'must provide a constructor function');
  });
  it('should throw without a name', function() {
    assert.throw(function() {
      injector.bind(function() {});
    }, 'must either provide a name argument, option, or named function');
  });
});
