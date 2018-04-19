/**
 * The Bot Itself
 */

const Bot = require('../bot')

var paths = { }

// Loader. So we don't have to individually require each file.
var normalizedPath = require("path").join(__dirname, "controllers");
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  paths = Object.assign(paths,require("./controllers/" + file).swaggerDef);
});

var bot = new Bot({config: {port: 3000}});
bot.registerPaths(paths,"./controllers");
bot.start();