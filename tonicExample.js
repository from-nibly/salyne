var Salyne = require('salyne'),
  injector = new Salyne();

injector.bind('foo', function(bar, bang) {
  this.bar = bar;
  this.bang = bang;
});

var bar = 0;
injector.bind('bar', { singleton : true}, function() {
  this.bar = bar++;
});

var bang = 0;
injector.bind('bang', function() {
  this.bang = bang++;
});

var foo1 = injector.create('foo');
var foo2 = injector.create('foo');

console.log(foo1.bar.bar, '=', foo2.bar.bar);
console.log(foo1.bang.bang, '!=', foo2.bang.bang);
