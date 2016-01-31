var foo = 6;
exports = module.exports = function ClassY() {
  this.test = foo++;
};
exports.singleton = true;
