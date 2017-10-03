"use strict";

var bot = require('../index.js')
var models = require('./models.js')
var rp = require('request-promise');

// We only need to do this once. Bot is a singleton.
bot.configure({
  logging: true,
  name: "JsonPlaceholder harvester",
  desc: "Harvests from JSON Placeholder",
  rabbit: {
    enable: true,
    url: 'amqp://rabbitmq:rabbitmq@localhost:5672?heartbeat=3600',
    routingKey: 'syncevents.harvester.updates.example',
    exchange: 'syncevents'
  },
  neo4j: {
    enable: true,
    url: "bolt://localhost",
    user: "neo4j",
    pass: "password"
  }
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