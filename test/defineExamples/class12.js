var foo = 12;
define(function() {
  this.a = foo++;
});
define('Class12', function() {
  this.a = foo++;
});
