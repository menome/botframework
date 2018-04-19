module.exports.get = function(req,res) {
  return res.json({
    name: req.bot.config.get("name"),
    nickname: req.bot.config.get('nickname') || undefined,
    desc: req.bot.config.get('desc')
  });
}