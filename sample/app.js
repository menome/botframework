"use strict";

var bot = require('../index.js')
var models = require('./models.js')
var config = require('./config.js');
var rp = require('request-promise');

// We only need to do this once. Bot is a singleton.
bot.configure({
  name: "JsonPlaceholder harvester",
  desc: "Harvests from JSON Placeholder",
  logging: config.get('logging'),
  port: config.get('port'),
  rabbit: config.get('rabbit'),
  neo4j: config.get('neo4j')
})

// Register our sync endpoint.
bot.registerEndpoint({
  "name": "Synchronize",
  "path": "/sync",
  "method": "POST",
  "desc": "Runs a full sync of the harvester."
}, function(req,res) {
  res.send("Starting the Harvest")
  models.queryTransforms.forEach(({desc,url,transform}) => {
    bot.logger.info(desc);
    getEndpoint(url,transform);
  })
})

// Fetches from the URL, transforms the results using the transform function, publishes the message.
function getEndpoint(uri, transformFunc) {
  var options = {
    uri: uri,
    json: true,
    headers: {'User-Agent': 'Request-Promise'}
  }

  return rp(options)
    .then(function(itms) {
      itms.forEach((itm) => {
        bot.rabbitPublish(transformFunc(itm))
      })
    })
    .catch(function(err) {
      log.error(err.toString());
    })
}

// Start the bot.
bot.start();
bot.changeState({state: "idle"})