var foo = 6;
var ctor = function() {
  this.test = foo++;
};
ctor['@singleton'] = true;
define('Class4', ctor);
