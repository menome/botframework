/*
 * Copyright (C) 2017 Menome Technologies Inc.
 *
 * Bot Framework Root
 */
"use strict";
var http = require('http');
var https = require('https');
var express = require("express");
import { v4 as uuidv4 } from 'uuid';
var logger = require('../logger');
var rabbit = require('../rabbitmq');
var configManager = require('./config.js');
var neo4j = require('../neo4j');
var librarian = require('../librarian');
var schema = require('../helpers/schema');
var helpers = require('../helpers');
var bodyParser = require('body-parser');
var fs = require('fs');
var swagger = require('swagger-tools');
var swaggerObject = require('./swagger/index.json');

/**
 * Creates a new bot.
 * 
 * @param {*} config Configuration JSON object.
 * @param {*} schema Convict Schema. Merge this with base bot config.
 */
module.exports = function({config, configSchema}) {
  // Public vars
  this.web = express()
  this.state = { status: "initializing" }
  this.web.use(bodyParser.json());
  this.config = configManager.loadConfig(config, configManager.mergeSchema(configSchema));
  this.logger = logger
  this.logger.logging = this.config.get('logging');

  // Some internal objects or whatever.
  this.genUuid = uuidV4;
  if(this.config.get('neo4j').enable)
    this.neo4j = new neo4j(this.config.get('neo4j'));
  if(this.config.get('rabbit').enable) {
    this.rabbit = new rabbit(this.config.get('rabbit'));
    this.rabbit.connect();
  }
  if(this.config.get('librarian').enable) {
    this.librarian = new librarian(this.config.get('librarian'));
  }
    
  ////////////////
  // Swagger Stuff
  var swaggerConfig = {
    appRoot: __dirname, // required config
    useStubs: false,
    controllers: [
      __dirname + '/controllers'
    ]
  };

  swaggerObject.info.version = process.env.npm_package_version || "1.0.0";
  swaggerObject.info.title = this.config.get('name');
  swaggerObject.basePath = this.config.get('urlprefix');

  // Methods
  this.changeState = function(newState) {
    var errors = schema.validate('botState',newState)
    if (errors) {
      this.logger.error("Not a valid application state:", errors);
      return false;
    }
    else return this.state = newState;
  }

  /**
   * Register swagger endpoints.
   * 
   * Paths is a swagger path spec. It will be merged into the base bot path spec.
   * controllerDir is a string directory where we will find swagger controllers.
   */
  this.registerPaths = function(paths, controllerDir) {
    swaggerConfig.controllers.push(controllerDir);
    Object.assign(swaggerObject.paths, paths);
  }

  /**
   * Register swagger endpoints.
   * 
   * controllerDir is a string directory where we will find swagger controllers.
   * These controllers should all have a 'swaggerDef' export.
   */
  this.registerControllers = function(controllerDir) {
    var paths = helpers.getSwaggerPaths(controllerDir)
    swaggerConfig.controllers.push(controllerDir);
    Object.assign(swaggerObject.paths, paths);
  }
  
  // Start the webserver.
  this.start = function() {
    this.logger.info("Initializing Swagger Middleware")
    swagger.initializeMiddleware(swaggerObject, function(middleware) {
      this.web.use((req,res,next) => {
        req.bot = this;
        req.swaggerObject = swaggerObject;
        next();
      });

      this.web.use(middleware.swaggerMetadata());
      this.web.use(middleware.swaggerValidator());
      this.web.use(middleware.swaggerRouter(swaggerConfig));
      this.web.use(middleware.swaggerUi());
    }.bind(this));

    http.createServer(this.web).listen(this.config.get('port'));
    this.logger.info("Listening on", { port:this.config.get('port') })

    // If we have SSL, use it.
    if(this.config.get('ssl.enable')) {
      var key = fs.readFileSync(this.config.get('ssl.keypath'));
      var cert = fs.readFileSync(this.config.get('ssl.certpath'));
      https.createServer({key,cert}, this.web).listen(this.config.get('ssl.port'))
    }
  }
}