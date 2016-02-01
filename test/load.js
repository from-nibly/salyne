var Salyne = require('../index.js'),
  assert = require('chai')
  .assert;

describe('load', function() {
  var injector;
  beforeEach(function() {
    injector = new Salyne({
      parent: module
    });
  });

  it('should load a single class file', function() {
    injector.load('./examples/class1.js');
    var expected = {
      test: 5
    };
    var actual = injector.create('class1');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file with a different name', function() {
    injector.load('./examples/class2.js');
    var expected = {
      test: 6
    };
    var actual = injector.create('ClassX');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file and name it', function() {
    injector.load('./examples/class2.js', 'ClassZ');
    var expected = {
      test: 6
    };
    var actual = injector.create('ClassZ');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file as singleton property', function() {
    injector.load('./examples/class3.js');
    var expected = injector.create('ClassY');
    var actual = injector.create('ClassY');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file as singleton annotation', function() {
    injector.load('./examples/class4.js');
    var expected = injector.create('ClassA');
    var actual = injector.create('ClassA');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file as singleton option', function() {
    injector.load('./examples/class5.js', {
      singleton: true
    });
    var expected = injector.create('ClassB');
    var actual = injector.create('ClassB');
    assert.deepEqual(expected, actual);
  });
  it('should load a folder of class files with names', function() {
    injector.load('./examples/');
    var expected = {
      test: 6
    };
    var actual = injector.create('ClassX');
    assert.deepEqual(expected, actual);
    var expected = {
      test: 5
    };
    var actual = injector.create('class1');
    assert.deepEqual(expected, actual);
  });
  it('should load a folder of class files with names and dependencies as signature', function() {
    injector.load('./examples/');
    var expected = {
      test: 9,
      a: {
        test: 7
      },
      b: {
        test: 10
      }
    };
    var actual = injector.create('ClassC');
    assert.deepEqual(expected, actual);
  });
  it('should load a folder of class files with names and dependencies as property', function() {
    injector.load('.//examples/');
    var expected = {
      test: 10,
      a: {
        test: 8
      },
      b: {
        test: 11
      }
    };
    var actual = injector.create('ClassD');
    assert.deepEqual(expected, actual);
  });
  it('should load a folder of class files with names and dependencies as an annotation', function() {
    injector.load('./examples/');
    var expected = {
      test: 11,
      a: {
        test: 9
      },
      b: {
        test: 12
      }
    };
    var actual = injector.create('ClassE');
    assert.deepEqual(expected, actual);
  });
  it('should load a folder of class files with names and dependencies that have dependencies', function() {
    injector.load('./examples/');
    var expected = {
      test: 1,
      e: {
        test: 11,
        a: {
          test: 10
        },
        b: {
          test: 13
        }
      }
    };
    var actual = injector.create('ClassF');
    assert.deepEqual(expected, actual);
  });
  it('should grab node modules', function() {
    var fs = injector.create('fs');
    assert.instanceOf(fs.readdirSync, Function)
  });
  it('should throw on cirucular dependency', function() {
    injector.load('./examples/');
    assert.throw(function() {
      var actual = injector.create('ClassG');
    }, 'circular dependency detected: ClassG,ClassG');
  });
  it('should throw on missing dependency', function() {
    assert.throw(function() {
      var actual = injector.create('ClassG');
    }, 'could not find dependency ClassG');
  });
});
