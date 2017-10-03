#!/usr/bin/env node
"use strict";
var http = require('http');
var express = require("express");
var logger = require('./src/logger');
var rabbit = require('./src/rabbit');
var mergeConf = require('./src/config.js');
var neo4j = require('./src/neo4j')

// Constructor for bot framework.
module.exports = (function() {
  var bot = {
    config: {},
    logger: logger,
    web: express(),
    operations: [],
    state: {
      status: "idle"
    },
    rabbitClient: {},
    neo4jClient: {}
  };
  
  // Call this before starting the bot.
  bot.configure = function(config) {
    bot.config = mergeConf(config);
    bot.logger.logging = bot.config.logging;

    if(bot.config.rabbit.enable)
      bot.rabbitClient = new rabbit(bot.config.rabbit);
    if(bot.config.neo4j.enable)
      bot.neo4jClient = new neo4j(bot.config.neo4j);
  }

  // Function to update status.
  bot.changeState = function(status) {
    bot.state.status = status;
  }

  // All bots have the same root response format.
  bot.web.get('/', function (req, res, next) {
    return res.json({
      name: bot.config.name,
      desc: bot.config.desc,
      operations: bot.operations
    });
  });

  // All bots have the status endpoint.
  bot.web.get('/status', function(req,res,next) {
    return res.json(bot.state);
  });

  // Allow the user to register operations.
  bot.registerEndpoint = function(meta, func) {
    bot.operations.push(meta);
    switch(meta.method) {
      case 'GET': bot.web.get(meta.path,func); break;
      case 'POST': bot.web.post(meta.path,func); break;
      case 'PUT': bot.web.put(meta.path,func); break;
      case 'OPTIONS': bot.web.options(meta.path,func); break;
      default: bot.logger.error("Could not register operation.")
    }
  }

  // Allow the user to publish to rabbitmq. (with the routing key and exchange configured.)
  bot.rabbitPublish = function(msg)  {
    return bot.rabbitClient.publishMessage(msg)
  }

  // Allow the user to create a queue and subscribe to a message.
  // handleMessage should be a function that takes a message and returns a promise.
  // The promise should be falsy if we want to nack the message without requeue.
  // Should throw an exception if we want to nack and requeue it.
  bot.rabbitSubscribe = function(queueName,handleMessage,schemaName) {
    return bot.rabbitClient.addListener(queueName,handleMessage,schemaName)
  }

  bot.query = function(query,params,cb) {
    return bot.neo4jClient.query(query,params,cb)
  }

  // Allow the user to start the server.
  bot.start = function() {
    // Web
    http.createServer(bot.web).listen(bot.config.port);
    bot.logger.info("Listening on port", bot.config.port)

    // Rabbit
    if(bot.config.rabbit.enable) bot.rabbitClient.connect();
  }

  return bot;
}());