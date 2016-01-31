var foo = 9;
exports = module.exports = function ClassB() {
  this.test = foo++;
};
exports.singleton = true;
