/*
 * Copyright (C) 2017 Menome Technologies Inc.
 *
 * Manages connection to RabbitMQ.
 */
"use strict";
var amqp = require('amqplib');
var log = require('../logger');
var schema = require('../helpers/schema');

// Constructor for Rabbit interface.
module.exports = function(config) {
  this.config = config;

  var rabbitConnectInterval;
  var rabbitChannel;
  var handlers = [];

  // Subscribes to the RabbitMQ 
  this.connect = function() {
    rabbitConnectInterval = setInterval(rabbitConnect, 5000);
    rabbitConnect();
  }

  // Handles parsing of the message into JSON and validating against the schema.
  // On success, passes the message on.
  function handlerWrapper(msg,handler,schemaName) {
    var parsed = {};
    
    try {
      parsed = JSON.parse(msg.content);
    }
    catch(ex) {
      log.error("Malformed JSON in message");
      return Promise.resolve(false);
    }
    
    if(schemaName) {
      var errors = schema.validate(schemaName, parsed);
      if (errors) {
        log.error("Received message was malformed:", errors);
        return Promise.resolve(false);
      }
    }

    return handler(parsed)
  }

  // Private message to actually get in there.
  function rabbitConnect() {
    log.info("Attempting to connect to RMQ.");
    return amqp.connect(config.url)
      .then(function(conn) {
        conn.on('error', function(err) {
          log.error(err);
          conn.close();
          rabbitChannel = null;
          rabbitConnectInterval = setInterval(rabbitConnect, 5000);
        });
        log.info("Connected to RMQ");
        return conn.createChannel();
      })
      .then(function(channel) {
        log.info("Created channel")
        channel.prefetch(config.prefetch); // Set our prefetch value.
        clearInterval(rabbitConnectInterval); // Stop scheduling this task if it's finished.
        rabbitChannel = channel;
        return channel.assertExchange(config.exchange, config.exchangeType, {durable: true});
      })
      // When we're connected, register all our listeners/handlers.
      .then(() => {
        handlers.forEach(({handler,queueName,schemaName}) => {
          return rabbitChannel.assertQueue(queueName, {durable: true})
            .then(function(q) {
              log.info("Waiting for messages in %s on exchange '%s'", q.queue, config.exchange);
              rabbitChannel.bindQueue(q.queue, config.exchange, config.routingKey);
              rabbitChannel.consume(q.queue, function (msg) {
                return handlerWrapper(msg,handler,schemaName)
                  .then(function (result) {
                    if(result) rabbitChannel.ack(msg);
                    else rabbitChannel.nack(msg, false, false);
                  })
                  .catch(function (err) {
                    log.error(err);
                    rabbitChannel.nack(msg, false, false);
                  });
              }, { noAck: false })
            })
            .catch((err) => {
              log.error("Failed to establish channel", err.message);
            });
        })
      })
      .catch((err) => {
        log.error("Failed to connect to RMQ. Will retry: %s", err.message);
      })
  }

  // Allow us to publish a message.
  // Optionally validate against a schema for some additional integrity.
  this.publishMessage = function(msg,schemaName) {
    if(!rabbitChannel) return Promise.resolve(false);

    if(schemaName) {
      var errors = schema.validate(schemaName, msg);
      if (errors) {
        log.error("Attempted to publish a malformed message:", errors);
        return Promise.resolve(false);
      }
    }

    var messageBuffer = new Buffer(JSON.stringify(msg));
    //TODO: Handle when publish queues messages due to full buffers.
    return rabbitChannel.publish(config.exchange,config.routingKey,messageBuffer)
  }

  // Adds a listener to the rabbit server.
  this.addListener = function(queueName,handleMessage,schemaName) {
    return handlers.push({
      handler: handleMessage,
      queueName: queueName,
      schemaName: schemaName
    })
  }

  this.disconnect = function() {
    if(rabbitChannel) rabbitChannel.disconnect();
    clearInterval(rabbitConnectInterval);
  }
}