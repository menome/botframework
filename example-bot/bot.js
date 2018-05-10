/**
 * The Bot Itself
 */

const Bot = require('../bot')

var bot = new Bot({config: {port: 3000}});
bot.registerControllers(__dirname+"/controllers");
bot.start();