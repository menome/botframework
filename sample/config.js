"use strict";
var convict = require('convict');
var fs = require('fs');
var bot = require('../index.js')

// Define a schema
var config = convict({
  url: {
    doc: "The URL of the REST Endpoint we're grabbing",
    format: "url",
    default: "https://jsonplaceholder.typicode.com",
    env: "API_URL"
  },
  port: bot.configSchema.port,
  logging: bot.configSchema.logging,
  neo4j: bot.configSchema.neo4j,
  rabbit: bot.configSchema.rabbit,
});

// Load from file.
if (fs.existsSync('sample/config.json')) {
  config.loadFile('sample/config.json');
}

// Validate the config.
config.validate({allowed: 'strict'});

module.exports = config;