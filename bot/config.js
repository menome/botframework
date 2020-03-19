/*
 * Copyright (C) 2017 Menome Technologies Inc.
 *
 * Merges the external config file with environment variables and default config values.
 */
"use strict";
const convict = require('convict')

/**
 * Merges the provided schema with the base bot schema.
 * Warning: It's a shallow copy.
 * 
 * @param {} mergeSchema Provided schema.
 */
module.exports.mergeSchema = function(schema) {
  return Object.assign({},module.exports.botSchema, schema);
}

/**
 * Loads config. Returns a convict object with the desegnated schema and values.
 * 
 * @param {} config The configuration values
 * @param {} schema The schema we're configuring.
 */
module.exports.loadConfig = function(config, schema) {
  var convictConfig = convict(schema);
  convictConfig.load(config);
  convictConfig.validate();
  return convictConfig;
}

// Config schema for use with mozilla convict.
// This isn't required. It's just to make the bot's lives easier.
module.exports.botSchema = {
  name: {
    doc: "Name of this bot. Should represent the bot's type. Eg. 'webDAVScraper'",
    format: "String",
    default: "Unconfigured bot.",
    env: "BOT_NAME"
  },
  desc: {
    doc: "Explanation of what this bot does.",
    format: "String",
    default: "No Description",
    env: "BOT_DESC"
  },
  nickname: {
    doc: "Nickname for this bot. If present, the Bot will advertise itself with this name. For differentiating multiple bots of the same type (eg. Multiple File crawlers.)",
    format: "String",
    default: "",
    env: "BOT_NICKNAME"
  },
  port: {
    doc: "The port to listen on.",
    format: "port",
    default: 3000,
    env: "PORT"
  },
  logging: {
    doc: "Whether or not we're logging",
    format: "Boolean",
    default: true,
    env: "LOGGING_ENABLED"
  },
  urlprefix: {
    doc: "If we want to prefix our bot endpoints. Eg. specifying '/api' would mean all your endpoints now reside at '/api/<thing>' instead of '/<thing>'",
    format: "String",
    default: "/",
    env: "BOT_URL_PREFIX"
  },
  rabbit: {
    enable: {
      doc: "Whether or not to connect to RabbitMQ",
      format: "Boolean",
      default: false,
      env: "RABBIT_ENABLE"
    },
    url: {
      doc: "The URL of the rabbitmq endpoint. ",
      format: String,
      default: "amqp://rabbitmq:rabbitmq@rabbit:5672?heartbeat=3600",
      env: "RABBIT_URL",
      sensitive: true
    },
    routingKey: {
      doc: "The URL of the rabbitmq endpoint. ",
      format: String,
      default: "syncevents.harvester.updates.example",
      env: "RABBIT_ROUTING_KEY"
    },
    exchange: {
      doc: "The RMQ Exchange we're connecting to",
      format: String,
      default: "syncevents",
      env: "RABBIT_EXCHANGE"
    },
    exchangeType: {
      doc: "The type of RMQ exchange we're creating",
      format: ["topic","fanout"],
      default: "topic",
      env: "RABBIT_EXCHANGE_TYPE"
    },
    prefetch: {
      doc: "Number of items we can be processing concurrently",
      format: Number,
      default: 5,
      env: "RABBIT_PREFETCH" 
    }
  },
  neo4j: {
    enable: {
      doc: "Whether or not to connect to neo4j",
      format: "Boolean",
      default: false,
      env: "NEO4J_ENABLE"
    },
    encrypted: {
      doc: "Whether or not to use an encrypted connection to neo4j",
      format: "Boolean",
      default: true,
      env: "NEO4J_ENCRYPTED"
    },
    url: {
      doc: "The bolt URL of the neo4j server.",
      format: String,
      default: "bolt://localhost",
      env: "NEO4J_URL"
    },
    user: {
      doc: "The username of the Neo4j User",
      format: String,
      default: "neo4j",
      env: "NEO4J_USER"
    },
    pass: {
      doc: "The password of the Neo4j User",
      format: String,
      default: "password",
      env: "NEO4J_PASS",
      sensitive: true
    },
  },
  librarian: {
    enable: {
      doc: "Whether we're using the file librarian.",
      format: "Boolean",
      default: false,
      env: "LIBRARIAN_ENABLE"
    },
    host: {
      doc: "URL of the File Librarian",
      format: "String",
      default: "localhost:3020",
      env: "LIBRARIAN_HOST"
    },
    secret: {
      doc: "Secret for signing JWT to be carried to the File Librarian",
      format: "String",
      default: "nice web mister crack spider",
      env: "LIBRARIAN_SECRET",
      sensitive: true
    },
    username: {
      doc: "Username for Librarian access",
      format: "String",
      default: "admin",
      env: "LIBRARIAN_USERNAME"
    },
    password: {
      doc: "Password for Librarian access",
      format: "String",
      default: "password",
      env: "LIBRARIAN_PASSWORD",
      sensitive: true
    }
  },
  ssl: {
    enable: {
      doc: "Whether to server SSL",
      format: "Boolean",
      default: false,
      env: "SSL_ENABLE"
    },
    certpath: {
      doc: "Local filepath to the SSL cert to serve.",
      format: "String",
      default: "/srv/app/ssl/cert.pem",
      env: "SSL_CERTPATH"
    },
    keypath: {
      doc: "The local filepath to the SSL privatekey.",
      format: "String",
      default: "/srv/app/ssl/key.pem",
      env: "SSL_KEYPATH"
    },
    port: {
      doc: "The port to listen on for SSL.",
      format: "port",
      default: 443,
      env: "SSL_PORT"
    },
  }
}
