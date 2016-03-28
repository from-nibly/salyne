var Salyne = require('../index.js'),
  assert = require('chai').assert,
  path = require('path'),
  fs = require('fs');

describe('load', function() {
  var injector;
  beforeEach(function() {
    injector = new Salyne({
      parent: module
    });
    //clear require cache
    var loadExamples = fs.readdirSync(path.join(__dirname, 'loadExamples'));
    for(var x of loadExamples) {
      delete require.cache[require.resolve('./' + path.join('./loadExamples/', x))];
    }
  });

  it('should load a single class file', function() {
    injector.load('./loadExamples/class1.js');
    var expected = {
      test: 5
    };
    var actual = injector.create('class1');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file with a different name', function() {
    injector.load('./loadExamples/class2.js');
    var expected = {
      test: 6
    };
    var actual = injector.create('Class2');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file and name it', function() {
    injector.load('./loadExamples/class2.js', 'ClassZ');
    var expected = {
      test: 6
    };
    var actual = injector.create('ClassZ');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file as singleton property', function() {
    injector.load('./loadExamples/class3.js');
    var expected = injector.create('Class3');
    var actual = injector.create('Class3');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file as singleton annotation', function() {
    injector.load('./loadExamples/class4.js');
    var expected = injector.create('Class4');
    var actual = injector.create('Class4');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file as singleton option', function() {
    injector.load('./loadExamples/class5.js', {
      singleton: true
    });
    var expected = injector.create('Class5');
    var actual = injector.create('Class5');
    assert.deepEqual(expected, actual);
  });
  it('should load a folder of class files with names', function() {
    injector.load('./loadExamples/');
    var expected = {
      test: 6
    };
    var actual = injector.create('Class2');
    assert.deepEqual(expected, actual);
    var expected = {
      test: 5
    };
    var actual = injector.create('class1');
    assert.deepEqual(expected, actual);
  });
  it('should load a folder of class files with names and dependencies as signature', function() {
    injector.load('./loadExamples/');
    var expected = {
      test: 9,
      a: {
        test: 6
      },
      b: {
        test: 9
      }
    };
    var actual = injector.create('Class6');
    assert.deepEqual(expected, actual);
  });
  it('should load a folder of class files with names and dependencies as property', function() {
    injector.load('./loadExamples/');
    var expected = {
      test: 10,
      a: {
        test: 6
      },
      b: {
        test: 9
      }
    };
    var actual = injector.create('Class7');
    assert.deepEqual(expected, actual);
  });
  it('should load a folder of class files with names and dependencies as an annotation', function() {
    injector.load('./loadExamples/');
    var expected = {
      test: 11,
      a: {
        test: 6
      },
      b: {
        test: 9
      }
    };
    var actual = injector.create('Class8');
    assert.deepEqual(expected, actual);
  });
  it('should load a folder of class files with names and dependencies that have dependencies', function() {
    injector.load('./loadExamples/');
    var expected = {
      test: 1,
      e: {
        test: 11,
        a: {
          test: 6
        },
        b: {
          test: 9
        }
      }
    };
    var actual = injector.create('Class9');
    assert.deepEqual(expected, actual);
  });
  it('should grab node modules', function() {
    var fs = injector.create('fs');
    assert.instanceOf(fs.readdirSync, Function)
  });
  it('should throw on cirucular dependency', function() {
    injector.load('./loadExamples/');
    assert.throw(function() {
      var actual = injector.create('Class10');
    }, 'circular dependency detected: Class10,Class10');
  });
  it('should throw on missing dependency', function() {
    assert.throw(function() {
      var actual = injector.create('Class10');
    }, 'could not find dependency Class10');
  });
});
