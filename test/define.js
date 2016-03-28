var Salyne = require('../index.js'),
  assert = require('chai').assert,
  path = require('path'),
  fs = require('fs');

describe('define', function() {
  var injector;
  beforeEach(function() {
    injector = new Salyne({
      parent: module,
      amd : true
    });
    //clear require cache
    var defineExamples = fs.readdirSync(path.join(__dirname, 'defineExamples'));
    for(var x of defineExamples) {
      delete require.cache[require.resolve('./' + path.join('./defineExamples/', x))];
    }
  });
  it('should load a single class file', function() {
    injector.load('./defineExamples/class1.js');
    var expected = {
      test: 5
    };
    var actual = injector.create('class1');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file with a different name', function() {
    injector.load('./defineExamples/class2.js');
    var expected = {
      test: 6
    };
    var actual = injector.create('Class2');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file and name it', function() {
    injector.load('./defineExamples/class2.js', 'ClassZ');
    var expected = {
      test: 6
    };
    var actual = injector.create('ClassZ');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file as an options argument', function() {
    injector.load('./defineExamples/class3.js');
    var expected = injector.create('Class3');
    var actual = injector.create('Class3');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file as singleton annotation', function() {
    injector.load('./defineExamples/class4.js');
    var expected = injector.create('Class4');
    var actual = injector.create('Class4');
    assert.deepEqual(expected, actual);
  });
  it('should load a single class file as singleton option', function() {
    injector.load('./defineExamples/class5.js', {
      singleton: true
    });
    var expected = injector.create('Class5');
    var actual = injector.create('Class5');
    assert.deepEqual(expected, actual);
  });
  it('should load a folder of class files with names', function() {
    injector.load('./defineExamples/');
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
    injector.load('./defineExamples/');
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
    injector.load('./defineExamples/');
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
  it('should load a folder of class files with names and dependencies as an option', function() {
    injector.load('./defineExamples/');
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
    injector.load('./defineExamples/');
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
  it('should load multiple classes from a single file', function() {
    injector.load('./defineExamples/class11.js');
    var expected = {
      a : 11
    };
    var actual = injector.create('Class11');
    assert.deepEqual(expected, actual);
    var expected = {
      a : 12
    };
    var actual = injector.create('Class11.2');
    assert.deepEqual(expected, actual);
  });
  it('should load multiple classes from a single file and use file name for one', function() {
    injector.load('./defineExamples/class12.js');
    var expected = {
      a : 12
    };
    var actual = injector.create('class12');
    assert.deepEqual(expected, actual);
    var expected = {
      a : 13
    };
    var actual = injector.create('Class12');
    assert.deepEqual(expected, actual);
  });
  it('should load single class with multiple define when both use filename', function() {
    injector.load('./defineExamples/class13.js');
    var expected = {
      a : 13.2
    };
    var actual = injector.create('class13');
    assert.deepEqual(expected, actual);
  });
  it('should load single class with multiple define when both define the same name', function() {
    injector.load('./defineExamples/class14.js');
    var expected = {
      a : 14.2
    };
    var actual = injector.create('Class14');
    assert.deepEqual(expected, actual);
  });
  it('should load single class with multiple define when redefined using file name', function() {
    injector.load('./defineExamples/class15.js');
    var expected = {
      a : 15.2
    };
    var actual = injector.create('class15');
    assert.deepEqual(expected, actual);
  });
  it('should grab node modules', function() {
    var fs = injector.create('fs');
    assert.instanceOf(fs.readdirSync, Function)
  });
  it('should throw on cirucular dependency', function() {
    injector.load('./defineExamples/');
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
