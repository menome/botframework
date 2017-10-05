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

  Object.assign(rabbitConf, defaults.rabbit, conf.rabbit)
  Object.assign(neo4jConf, defaults.neo4j, conf.neo4j)
  Object.assign(mergedConf, defaults, conf)
  mergedConf.rabbit = rabbitConf;
  mergedConf.neo4j = neo4jConf;
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
  }
}