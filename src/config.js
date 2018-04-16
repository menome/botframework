/*
 * Copyright (C) 2017 Menome Technologies Inc.
 *
 * Merges the external config file with environment variables and default config values.
 */
"use strict";

var defaults = {
  name: "Unconfigured Harvester",
  desc: "Harvests from something",
  logging: true,
  port: 80,
  ssl: {
    enable: false,
    certpath: "/srv/app/ssl/cert.pem",
    keypath: "/srv/app/ssl/key.pem",
    port: 443,
  },
  rabbit: {
    enable: false,
    url: 'amqp://rabbitmq:rabbitmq@rabbit:5672?heartbeat=3600',
    routingKey: 'syncevents.harvester.updates.example',
    exchange: 'syncevents',
    exchangeType: 'topic'
  },
  neo4j: {
    enable: false,
    url: "bolt://localhost",
    user: "neo4j",
    pass: "password"
  }
}

// Merged external conf and default conf, prioritizing external conf.
module.exports.mergeConf = function(conf) {
  var mergedConf = {};
  var rabbitConf = {};
  var neo4jConf = {};
  var sslConf = {};

  Object.assign(rabbitConf, defaults.rabbit, conf.rabbit)
  Object.assign(neo4jConf, defaults.neo4j, conf.neo4j)
  Object.assign(sslConf, defaults.ssl, conf.ssl)
  Object.assign(mergedConf, defaults, conf)
  mergedConf.rabbit = rabbitConf;
  mergedConf.neo4j = neo4jConf;
  mergedConf.ssl = sslConf;
  return mergedConf;
}

// Config schema for use with mozilla convict.
// This isn't required. It's just to make the bot's lives easier.
module.exports.configSchema = {
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
  nickname: {
    doc: "Nickname for this bot. If present, the Bot will advertise itself with this name. For differentiating multiple bots of the same type (eg. Multiple File crawlers.)",
    format: "String",
    default: "",
    env: "BOT_NICKNAME"
  },
  urlprefix: {
    doc: "If we want to prefix our bot endpoints. Eg. specifying '/api' would mean all your endpoints now reside at '/api/<thing>' instead of '/<thing>'",
    format: "String",
    default: "/a",
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