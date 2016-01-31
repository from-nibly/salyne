var foo = 6;
exports = module.exports = function ClassA() {
  this.test = foo++;
};
exports['@singleton'] = true;
