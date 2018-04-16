/*
 * Copyright (C) 2017 Menome Technologies Inc.
 *
 * Bot Framework Root
 */
"use strict";

var http = require('http');
var https = require('https');
var express = require("express");
var uuidV4 = require('uuid/v4');
var logger = require('./src/logger');
var rabbit = require('./src/rabbit');
var config = require('./src/config.js');
var neo4j = require('./src/neo4j')
var schema = require('./src/schema')
var helpers = require('./src/helpers')
var bodyParser = require('body-parser');
var fs = require('fs');

module.exports = (function() {
  // Private Variables
  var rabbitClient = {}
  var neo4jClient = {}
  var state = {
    status: "initializing"
  }
  var web = express()
  web.use(bodyParser.json());
  
  // Public Variables
  var bot = {
    config: {},
    logger: logger,
    operations: [],
    web,
    configSchema: config.configSchema, // Surface the convict configuration to bots.
    helpers: helpers // Helper functions. Because why not.
  };
  
  ////////////////////////////////////
  // Bot Functions

  // Change the state of the bot.
  bot.changeState = function(newState) {
    var errors = schema.validate('botState',newState)
    if (errors) {
      bot.logger.error("Not a valid application state:", errors);
      return false;
    }
    else return state = newState;
  }

  // Call this before starting the bot.
  bot.configure = function(conf) {
    bot.config = config.mergeConf(conf);
    bot.logger.logging = bot.config.logging;

    if(bot.config.rabbit.enable) {
      bot.logger.info("Setting up Rabbit");
      rabbitClient = new rabbit(bot.config.rabbit);
    }
      
    if(bot.config.neo4j.enable) {
      bot.logger.info("Setting up Neo4j");
      neo4jClient = new neo4j(bot.config.neo4j);
    }

    if(!bot.config.urlprefix) bot.config.urlprefix = "";

    // All bots have the status endpoint. Register it here.
    bot.registerEndpoint({
      "name": "Status",
      "path": "/status",
      "method": "GET",
      "desc": "Gets the bot's current status."
    }, function(req,res,next) {
      return res.json(state);
    })

    // Send generic response for GET on '/'
    web.get(bot.config.urlprefix+'/', function (req, res, next) {
      return res.json({
        name: bot.config.name,
        nickname: bot.config.nickname || undefined,
        desc: bot.config.desc,
        operations: bot.operations
      });
    });
  }

  // Start the bot.
  bot.start = function() {
    http.createServer(web).listen(bot.config.port);
    bot.logger.info("Listening on port", bot.config.port)

    // If we have SSL, use it.
    if(bot.config.ssl.enable) {
      var key = fs.readFileSync(bot.config.ssl.keypath);
      var cert = fs.readFileSync(bot.config.ssl.certpath);
      https.createServer({key,cert}, web).listen(bot.config.ssl.port)
    }

    // RabbitMQ Config.
    if(bot.config.rabbit.enable) rabbitClient.connect();
  }

  ////////////////////////////////////
  // Webservice Configuration

  // Allow the user to register operations. Do this before starting the bot.
  // TODO: Allow configured URL parameters and/or body parsing.
  bot.registerEndpoint = function(meta, func) {
    var errors = schema.validate('endpointMetadata',meta)
    if (errors) {
      bot.logger.error("Not a valid endpoint definition:", errors);
      return false;
    }

    var prefixedPath = bot.config.urlprefix + meta.path;

    bot.operations.push(meta);
    switch(meta.method) {
      case 'GET': web.get(prefixedPath,func); break;
      case 'POST': web.post(prefixedPath,func); break;
      case 'PUT': web.put(prefixedPath,func); break;
      case 'OPTIONS': web.options(prefixedPath,func); break;
      case 'DELETE': web.delete(prefixedPath,func); break;
      default: bot.logger.error("Could not register operation.")
    }
    return bot.operations;
  }

  bot.responseWrapper = function({status, message, ...args}) {
    if(!status) status = "success";
    if(!message) throw new Error("API responses must contain a message.")

    if(['success','failure'].indexOf(status) === -1)
      throw new Error("Invalid status on message.")

    return {
      ...args,
      status: status,
      message: message
    }
  }

  ////////////////////////////////////
  // Helper Functions

  // Allow the user to publish to rabbitmq. (with the routing key and exchange configured.)
  bot.rabbitPublish = function(...args) {
    if(!bot.config.rabbit.enable) return;
    return rabbitClient.publishMessage(...args)
  }

  // Allow the user to create a queue and subscribe to a message.
  // Do this before starting the bot.
  bot.rabbitSubscribe = function(...args) {
    if(!bot.config.rabbit.enable) return;
    return rabbitClient.addListener(...args)
  }

  // Allow the user to query the DB.
  bot.query = function(...args) { 
    if(!bot.config.neo4j.enable) return;
    return neo4jClient.query(...args)
  }

  // Allow the user to generate UUIDs.
  bot.genUuid = uuidV4;

  return bot;
}());
