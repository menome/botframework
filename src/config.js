/*
 * Copyright (C) 2017 Menome Technologies Inc.
 *
 * Merges the external config file with environment variables and default config values.
 */
"use strict";

var defaults = {
  name: "Unconfigured Harvester",
  desc: "Harvests from something",
  logging: "true",
  port: process.env.PORT || 3000,
  rabbit: {
    enable: false,
    url: 'amqp://rabbitmq:rabbitmq@rabbit:5672?heartbeat=3600',
    routingKey: 'syncevents.misc',
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
module.exports = function(conf) {
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
