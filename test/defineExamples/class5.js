var foo = 9;
var ctor = function Class5() {
  this.test = foo++;
};
ctor.singleton = true;
define(ctor);
