var Salyne = require('../index.js'),
  assert = require('chai').assert;

describe('configure', function() {
  var injector;
  beforeEach(function() {
    injector = new Salyne();
  });

  it('should configure a single dependency to not be a singleton', function() {
    var foo = 0;
    injector.bind(function test() {
      foo += 1;
    }, { singleton : true });

    var first = injector.create('test');
    assert.equal(foo, 1);
    var second = injector.create('test');
    assert.equal(foo, 1);
    injector.configure('test', { singleton : false });
    var third = injector.create('test');
    assert.equal(foo, 2);
  });

  it('should configure a single dependency to be a singleton', function() {
    var foo = 0;
    injector.bind(function test() {
      foo += 1;
    }, { singleton : false });

    var first = injector.create('test');
    assert.equal(foo, 1);
    var second = injector.create('test');
    assert.equal(foo, 2);
    injector.configure('test', { singleton : true });
    var third = injector.create('test');
    assert.equal(foo, 2);
  });

  it('should configure multiple dependencies to be a singleton varargs', function() {
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
    injector.configure('test1', 'test2', { singleton : false });
    injector.create('test1');
    assert.equal(foo, 3);
    injector.create('test2');
    assert.equal(foo, 4);
  });

  it('should configure multiple dependencies to be a singleton array', function() {
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
    injector.configure(['test1', 'test2'], { singleton : false });
    injector.create('test1');
    assert.equal(foo, 3);
    injector.create('test2');
    assert.equal(foo, 4);
  });
});
