/**
* Copyright (C) 2017 Menome Technologies.
*
* Contains shared code for contacting the Neo4j Database.
*/
"use strict";

var neo4j = require('neo4j-driver').v1;

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
        if(cb) cb(null, result);
        return result;
      })
      .catch(function(err) {
        session.close();
        if(cb) cb(err, null);
        throw err;
      });
  };

  // Runs multiple DB queries in a single session.
  // The callback will give the first error, or a list of all the results.
  // The queries are executed sequentially, not in parallel.
  this.batchQuery = function(queryStrList, queryParamsList, cb) {
    var session = driver.session();
    var resultList = [];
    var listIdx = 0;

    var runNext = () => {
      return session.run(queryStrList[listIdx], queryParamsList[listIdx])
        .then(callbackNext).catch((err) => {
          session.close();
          if(cb) return cb(err, null);
          return Promise.reject(err);
        });
    }
    
    // When we successfully execute a query, execute the next.  
    var callbackNext = function(result) {
      resultList.push(result);
      listIdx += 1;
      if (listIdx >= queryStrList.length) {
        session.close();
        if(cb) return cb(null, resultList);
        return resultList;
      }
      else {
        return runNext();
      }
    }

    return runNext();
  };

  this.closeDriver = function() {
    if(driver) driver.close();
    driver = undefined;
  }
}