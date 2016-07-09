// Copyright (c) 2016 Jordan S. Davidson
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var fs = require('fs'),
  path = require('path'),
  util = require('./util.js');

exports = module.exports = function Salyne(options) {
  var registry = {};
  var parent;
  var self = this;
  options = options || {};

  if (options.parent) {
    parent = options.parent;
  } else {
    parent = module;
    while (parent.parent) {
      parent = parent.parent;
    }
  }

  this.create = function(name) {
    return create(name, [name]);
  };

  var create = (name, dir) => {
    var entry = registry[name];
    if (!entry) {
      try {
        return parent.require(name);
      } catch (e) {
        var msg = `could not find dependency ${name}`
        if(dir && dir.length > 1) {
          msg += ` path was: ${dir.join('->')}`
        }
        throw new Error(msg);
      }
    } else if (entry.options.singleton === true && entry.instance) {
      return entry.instance;
    } else {
      var instance;
      var deps = [];
      for (var req of entry.requires) {
        //create a copy of our dependency path
        var newDir = dir.slice();
        newDir.push(req);
        //check for circular dependency
        if (newDir.indexOf(req) !== newDir.length - 1) {
          throw new Error(`circular dependency detected: ${newDir.toString()}`);
        }
        //push the arg
        deps.push(create(req, newDir));
      }
      entry.instance = new entry.ctor(...deps);
      return entry.instance;
    }
  };

  this.run = function(name) {
    var entry = registry[name];
    if(!entry) {
      throw new Error(`unable to find runnable ${name}`);
    }
    if(!entry.options.runnable) {
      throw new Error(`${name} is not runnable set "runnable" to true in it's options`);
    }
    var args = [];
    for(var req of entry.requires) {
      args.push(this.create(req));
    }
    return entry.ctor(...args);
  };

  function extractArgs(func) {
    var rtn = func.requires
      || func.require
      || func['@requires']
      || func['@require'];
    if(rtn) {
      return rtn;
    }
    rtn = [];
    var argStrings = util.getArgs(func);
    for (arg of argStrings) {
      //if chunck is only whitespace ignore
      if (arg.match(/^\s*$/)) {
        continue;
      }
      //remove white space
      arg = arg.replace(/\s/, '');
      rtn.push(arg);
    }
    return rtn;
  }

  this.factory = function() {
    var self = this;
    var exclusions = Object.keys(arguments)
      .map(x => arguments[x]);
    var name = exclusions.splice(0, 1);
    var entry = registry[name];

    if(!entry) {
      throw new Error(`could not find dependency ${name} for factory creation`);
    } else if (entry.options.singleton === true) {
      throw new Error("can't create factory for a singleton");
    } else {
      var factory = function() {
        var depObj = Object.keys(arguments)
          .map(x => arguments[x]);
        var deps = [];
        for (var req of entry.requires) {
          //if you have excluded the requirement from the factory
          var index = exclusions.indexOf(req);
          if(index !== -1) {
            //get it from the dependency object
            var dep = depObj[index];
            if(!dep) {
              throw new Error(`must provide instance of ${req}`);
            }
            deps.push(dep);
          } else {
            deps.push(self.create(req));
          }
        }
        return new entry.ctor(...deps);
      }
      factory.options = entry.options;
      return factory;
    }
  };

  this.inject = function() {
    var func = util.getFuncArg(arguments);
    var options = util.getObjectArg(arguments) || {};

    var requirements = util.getArrayArg(arguments) || extractArgs(func);

    var deps = [];
    for(var req of requirements) {
      deps.push(this.create(req));
    }
    func(...deps);
  };

  this.bind = function() {
    //setup incoming arguments
    var func = util.getFuncArg(arguments);
    var name = util.getStringArg(arguments);
    var options = util.getObjectArg(arguments) || {};

    //initialize blank arguments
    if (!func) {
      throw new Error('must provide a constructor function');
    }
    options.singleton = options.singleton || func.singleton || func['@singleton'] || false;
    name = name || func.name || options.name;
    if (!name) {
      throw new Error('must either provide a name argument, option, or named function');
    }

    var entry = {
      options: options,
      ctor: func
    };

    //get dependencies
    entry.requires = extractArgs(func);

    //put values in registry
    registry[name] = entry;
  };

  this.load = function() {
    var name = util.getArg(arguments, arg => typeof arg === 'string' && !util.isFile(arg) && !util.isFolder(arg));

    var fileName = util.getArg(arguments, arg => util.isFile(arg) || util.isFolder(arg));
    if(fileName) {
      fileName = path.join(path.dirname(parent.filename), fileName)
    }

    var options = util.getObjectArg(arguments) || {};

    //initialize fileNames
    var fileNames = [];
    if (!util.isFile(fileName)) {
      for (var file of fs.readdirSync(fileName)) {
        fileNames.push(path.join(fileName, file));
      }
    } else {
      fileNames.push(fileName);
    }

    if(fileNames.length > 1 && name) {
      throw new Error('cannot set name when loading more than one file');
    }
    //setup name
    for (var file of fileNames) {
      if (!util.isFile(file)) {
        continue;
      }
      this.fileName = util.fileToName(file);
      this.overrideName = name;
      //prevent breaking other globals
      var oldDefine = global.define;
      global.define = define;
      //require file
      var ctor = parent.require(file);
      //restore other global
      global.define = oldDefine;
      this.fileName = null;
      if(typeof ctor === 'function') {
        for(var x in ctor) {
          options[x] = ctor[x];
        }
        var depName = name || ctor.name || util.fileToName(file);
        this.bind(depName, ctor, options);
      } else if(this.defineCalled === true) {
        this.defineCalled === false;
      } else if(file.endsWith(".json")) {
        var depName = name || util.fileToName(file);
        this.bind(depName, options, function() {
          return Object.assign({}, ctor);
        });
      } else {
        throw new Error(`file ${file} did not return a constructor, was not "defined" and did not have a .json extension`);
      }
    }
  };

  var define = function() {
    var func = util.getFuncArg(arguments);
    var options = util.getObjectArg(arguments) || {};
    var name = self.overrideName ||  util.getStringArg(arguments) || func.name || self.fileName;
    func.require = util.getArrayArg(arguments);
    self.defineCalled = true;
    self.bind(name, func, options);
  };

  this.configure = function() {
    var names = util.getStringVarArgs(arguments);
    var options = util.getObjectArg(arguments);
    if(!options) {
      throw new Error('must provide options to configure');
    }
    //lookup existing dependency
    for(var name of names) {
      var entry = registry[name];
      if(!entry) {
        throw new Error(`no bound dependency ${name}`);
      } else {
        entry.options = options;
      }
    }
  };

  this.resetSingleton = function() {
    var names = util.getStringVarArgs(arguments);
    for(var name of names) {
      var entry = registry[name];
      if(!entry) {
        throw new Error(`no bound dependency ${name}`);
      } else {
        entry.instance = null;
      }
    }
  };
};

//convenience static method for node_modules and nodejs packages only
var instance = null;
exports.inject = function() {
  if(!instance) {
    instance = new exports();
  }
  return instance.inject(...arguments);
};
