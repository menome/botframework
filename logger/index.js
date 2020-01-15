/*
 * Copyright (C) 2017 Menome Technologies Inc.
 *
 * Logging wrapper.
 * 
 */

"use strict";

const winston = require('winston');

const logger = winston.createLogger({
  level: 'verbose',
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'logs/errors.log', level: 'error', format: winston.format.combine(      
      winston.format.timestamp(),
      winston.format.errors(),
      winston.format.json()
    )}),
    new winston.transports.File({ filename: 'logs/chat.log', format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )}),
    new winston.transports.Console({format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )})
  ]
})

module.exports = {  
  logging: true,
  info: function(msg, ...args) {
    if(this.logging) logger.log("info", msg, ...args);
  },
  error: function(msg, ...args) {
    if(this.logging) logger.log("error", msg, ...args);
  },
  log: function(level, msg, ...args) {
    if(this.logging) logger.log(level, msg, ...args);
  }
}