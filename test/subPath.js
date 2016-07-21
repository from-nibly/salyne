
var Salyne = require('../index.js'),
  assert = require('chai').assert;

describe('create', function() {
  var injector;
  beforeEach(function() {
    injector = new Salyne();
  });

  it('should load a node dependency with a single level path', function() {
    var expected = require('child_process').spawn;
    var actual = injector.create('child_process->spawn');
    assert.equal(expected, actual);
  });

  it('should load a dependency with a multiple levels path', function() {
    injector.bind(function config() {
      this.foo =  {
        bar : 5
      }
    });
    var expected = 5;
    var actual = injector.create('config->foo->bar');
    assert.equal(expected, actual);
  });

});
