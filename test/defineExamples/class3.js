var foo = 6;
define('Class3', function() {
  this.test = foo++;
}, { singleton : true });
