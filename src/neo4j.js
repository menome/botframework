/**
* Copyright (C) 2017 Menome Technologies.
*
* Contains shared code for contacting the Neo4j Database.
*/
"use strict";

var neo4j = require('neo4j-driver').v1;
var conf = require('./config');
var uuidV4 = require('uuid/v4');

// Constructor for neo4j interface
module.exports = function(config) {
  this.config = config;
  var driver = neo4j.driver(config.url, neo4j.auth.basic(config.user, config.pass));

  // Generic way for app to schedule queries, while getting passed any errors.
  // Accepts a callback cb(err,result) but also returns a promise
  this.query = function(queryStr, queryParams, cb) {
    if(!driver) driver = neo4j.driver(config.url, neo4j.auth.basic(config.user, config.pass));
    
    var session = driver.session();
    return session
      .run(queryStr, queryParams)
      .then(function(result) {
        session.close();
        if(!!cb) cb(null, result);
        return result;
      })
      .catch(function(err) {
        session.close();
        if(!!cb) cb(err, null);
        throw err;
      });
  };

  this.closeDriver = function() {
    if(driver) driver.close();
    driver = undefined;
  }
}