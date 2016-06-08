var Salyne = require('../index.js'),
  assert = require('chai').assert;

describe('run', function() {
  var injector;
  beforeEach(function() {
    injector = new Salyne();
  });

  it('should call a function that returns a number', function() {
    var ctor = function runner() {
      return 5;
    };
    injector.bind(ctor, { runnable : true });
    assert.equal(5, injector.run('runner'));
  });

  it('should call a function with dependencies', function() {
    injector.bind(function test() {
      this.foobar = 5;
    });
    injector.bind(function runner(test) {
      return test.foobar;
    }, { runnable : true });
    assert.equal(5, injector.run('runner'));
  });

  it('should call a function with multiple dependencies', function() {
    injector.bind(function test1() {
      this.foo = 'test';
    });
    injector.bind(function test2() {
      this.bar = 'ing';
    });
    injector.bind(function test3() {
      this.bang = ' this';
    });
    injector.bind(function runner(test1, test2, test3) {
      return test1.foo + test2.bar + test3.bang;
    }, { runnable : true });
    assert.equal('testing this', injector.run('runner'));
  });

  it('should throw on a function that is not a runnable', function() {
    var ctor = function notRunner() {
      return 5;
    };
    injector.bind(ctor);
    assert.throw(function() {
      injector.run('notRunner');
    }, 'notRunner is not runnable set "runnable" to true in it\'s options');
  });

  it('should throw on a function that is not a runnable', function() {
    assert.throw(function() {
      injector.run('doesntExist');
    }, 'unable to find runnable doesntExist');
  });
});
