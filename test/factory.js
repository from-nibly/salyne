var Salyne = require('../index.js'),
  assert = require('chai').assert;

describe('factory', function() {
  var injector;
  beforeEach(function() {
    injector = new Salyne();
  });

  it('should be able to create a factory with no requirements', function() {
    injector.bind(function foobar() {
      this.foo = 5;
    });
    var factory = injector.factory('foobar');
    var instance = factory();
    assert.equal(instance.foo, 5);
  });

  it('should be able to create a factory with no requirements multiple times', function() {
    var bar = 5;
    injector.bind(function foobar() {
      this.foo = bar++;
    });
    var factory = injector.factory('foobar');
    var instance1 = factory();
    var instance2 = factory();
    assert.equal(instance1.foo, 5);
    assert.equal(instance2.foo, 6);
    assert.equal(bar, 7);
  });

  it('should be able to create a factory with a requirement but no exclusions', function() {
    injector.bind(function foobar(bar) {
      this.bar = bar;
    });
    injector.bind(function bar() {
      this.bar = 6;
    });
    var factory = injector.factory('foobar');
    var instance = factory();
    assert.equal(instance.bar.bar, 6);
  });

  it('should be able to create a factory with a requirement and one exclusion', function() {
    injector.bind(function foobar(bar) {
      this.bar = bar;
    });
    injector.bind(function bar() {
      this.bar = 7;
    });
    var factory = injector.factory('foobar', 'bar');
    var instance = factory(injector.create('bar'));
    assert.equal(instance.bar.bar, 7);
  });

  it('should be able to create a factory with multiple requirements and one exclusion', function() {
    injector.bind(function foobar(bar, bang) {
      this.bar = bar;
      this.bang = bang;
    });
    injector.bind(function bar() {
      this.bar = 8;
    });
    injector.bind(function bang() {
      this.bang = 9;
    });
    var factory = injector.factory('foobar', 'bar');
    var instance = factory(injector.create('bar'));
    assert.equal(instance.bar.bar, 8);
    assert.equal(instance.bang.bang, 9);
  });
});
