var fs = require('fs'),
  path = require('path');
exports = module.exports = function Salyne(options) {
  var registry = {};
  var parent;
  options = options || {};
  if (options.parent) {
    parent = options.parent;
  } else {
    parent = module;
    while (parent.parent) {
      parent = parent.parent;
    }
  }

  this.create = function(name, dir) {
    dir = dir || [];
    var entry = registry[name];
    if (!entry) {
      try {
        return parent.require(name);
      } catch (e) {
        throw new Error(`could not find dependency ${name}`);
      }
    } else if (entry.options.singleton === true && entry.instance) {
      return entry.instance;
    } else {
      var instance;
      var args = [];
      for (var req of entry.requires) {
        var newDir = dir.slice();
        newDir.push(req);
        if (newDir.indexOf(req) !== newDir.length - 1) {
          throw new Error(`circular dependency detected: ${newDir.toString()}`);
        }
        args.push(this.create(req, newDir));
      }
      entry.instance = new entry.ctor(...args);
      return entry.instance;
    }
  };

  this.bind = function() {
    var func;
    var name;
    var options;
    //setup incoming arguments
    args = Object.keys(arguments)
      .map(x => arguments[x]);
    for (var arg of args) {
      if (typeof arg === 'function') {
        func = arg;
      } else if (typeof arg === 'string') {
        name = arg;
      } else if (typeof arg === 'object') {
        options = arg;
      }
    }
    //initialize blank arguments
    if (!func) {
      throw new Error('must provide a constructor function');
    }
    options = options || {};
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
    if (func.requires || func.require) {
      entry.requires = func.requires || func.require;
    } else if (func['@requires'] || func['@require']) {
      entry.requires = func['@requires'] || func['@require'];
    } else {
      entry.requires = [];
      var argString = func.toString()
        .match(/function\s*[^\(]*\(\s*([^\)]*)\)/m)[1];
      var argStrings = argString.split(',');
      for (arg of argStrings) {
        if (arg.match(/^\s*$/)) {
          continue;
        }
        arg = arg.replace(/\s/, '');
        entry.requires.push(arg);
      }
    }

    //put values in registry
    registry[name] = entry;
  };

  this.load = function() {
    var name;
    var fileName;
    var options;
    args = Object.keys(arguments)
      .map(x => arguments[x]);
    for (var arg of args) {
      if (typeof arg === 'string') {
        if (arg.endsWith('.js') || arg.endsWith('.json') || arg.indexOf('/') !== -1 || arg.indexOf('\\') !== -1) {
          fileName = path.join(path.dirname(parent.filename), arg);
        } else {
          name = arg;
        }
      } else if (typeof arg === 'object') {
        options = arg;
      }
    }
    //initialize fileNames
    var fileNames = [];
    if (!fileName.endsWith('.js') && !fileName.endsWith('.json')) {
      for (var file of fs.readdirSync(fileName)) {
        fileNames.push(path.join(fileName, file));
      }
    } else {
      fileNames.push(fileName);
    }
    //setup name
    for (var file of fileNames) {
      if (!file.endsWith('.js') && !file.endsWith('.json')) {
        continue;
      }
      var ctor = parent.require(file);
      var nameReg = /\/?([\w\.]*)(.js|.json)/gmi
      if (fileNames.length === 1) {
        name = name || ctor.name || nameReg.exec(file)[1];
      } else {
        name = ctor.name || nameReg.exec(file)[1];
      }
      this.bind(name, ctor, options);
    }
  };
};
