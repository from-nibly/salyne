var fs = require('fs'),
  path = require('path'),
  util = require('./util.js');

exports = module.exports = function AMD(salyne) {

  GLOBAL.define = function() {
    var func = util.getFuncArg(arguments);
    var options = util.getObjectArg(arguments) || {};
    var name = salyne.overrideName ||  util.getStringArg(arguments) || func.name || salyne.fileName;
    func.require = util.getArrayArg(arguments);
    salyne.defineCalled = true;
    salyne.bind(name, func, options);
  };

};
