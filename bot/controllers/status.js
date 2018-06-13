module.exports.get = function get(req,res) {
  return res.json(req.bot.state);
}
