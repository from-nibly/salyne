var Salyne = require('../index.js'),
  assert = require('chai').assert;

describe('resetSingleton', function() {
  var injector;
  beforeEach(function() {
    injector = new Salyne();
  });

  it('should reset a single dependency', function() {
    var foo = 0;
    injector.bind(function test() {
      foo += 1;
    }, { singleton : true });

    var first = injector.create('test');
    assert.equal(foo, 1);
    var second = injector.create('test');
    assert.equal(foo, 1);
    injector.resetSingleton('test');
    var third = injector.create('test');
    assert.equal(foo, 2);
  });

  it('should reset multiple dependency to be a singleton varargs', function() {
    var foo = 0;
    injector.bind(function test1() {
      foo += 1;
    }, { singleton : true });

    injector.bind(function test2() {
      foo += 1;
    }, { singleton : true });

    injector.create('test1');
    assert.equal(foo, 1);
    injector.create('test2');
    assert.equal(foo, 2);
    injector.create('test1');
    assert.equal(foo, 2);
    injector.create('test2');
    assert.equal(foo, 2);
    injector.resetSingleton('test1', 'test2');
    injector.create('test1');
    assert.equal(foo, 3);
    injector.create('test1');
    assert.equal(foo, 3);
    injector.create('test2');
    assert.equal(foo, 4);
    injector.create('test2');
    assert.equal(foo, 4);
  });

  it('should configure a multiple dependency to be a singleton array', function() {
    var foo = 0;
    injector.bind(function test1() {
      foo += 1;
    }, { singleton : true });

    injector.bind(function test2() {
      foo += 1;
    }, { singleton : true });

    injector.create('test1');
    assert.equal(foo, 1);
    injector.create('test2');
    assert.equal(foo, 2);
    injector.create('test1');
    assert.equal(foo, 2);
    injector.create('test2');
    assert.equal(foo, 2);
    injector.resetSingleton(['test1', 'test2']);
    injector.create('test1');
    assert.equal(foo, 3);
    injector.create('test1');
    assert.equal(foo, 3);
    injector.create('test2');
    assert.equal(foo, 4);
    injector.create('test2');
    assert.equal(foo, 4);
  });
});
