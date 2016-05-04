exports = module.exports = {};

exports.getArgs = function(func) {
  var result = func.toString()
    .match(/function\s*[^\(]*\(\s*([^\)]*)\)/m);
  return result[1].split(',');
};

exports.fileToName = function(filename) {
  return /\/?([\w\.]*)(.js|.json)/gmi.exec(filename)[1];
};

exports.isFile = function(name) {
  return (name.endsWith('.js') || name.endsWith('.json'))
};

exports.isFolder = function(name) {
  return name.indexOf('/') !== -1 || name.indexOf('\\') !== -1;
};

exports.getArg = function(args, pred) {
  args = Object.keys(args)
    .map(x => args[x]);
  for (var arg of args) {
    if(pred(arg)) {
      return arg;
    }
  }
};

exports.getVarArgs = function(args, pred) {
  args = Object.keys(args)
    .map(x => args[x]);
  var rtn = [];
  for(var arg of args) {
    if(!Array.isArray(arg)) {
      arg = [ arg ];
    }
    for(var x of arg) {
      if(pred(x)) {
        rtn.push((x))
      }
    }
  }
  return rtn;
};

exports.getStringArg = function(args) {
  return exports.getArg(args, arg => typeof arg === 'string');
};

exports.getStringVarArgs = function(args) {
  return exports.getVarArgs(args, arg => typeof arg === 'string');
};

exports.getArrayArg = function(args) {
  return exports.getArg(args, arg => Array.isArray(arg));
};

exports.getObjectArg = function(args) {
  return exports.getArg(args, arg => typeof arg === 'object' && !Array.isArray(arg));
};

exports.getFuncArg = function(args) {
  return exports.getArg(args, arg => typeof arg === 'function');
};
