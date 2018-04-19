module.exports.get = function get(req,res) {
  return res.json(this.state);
}
