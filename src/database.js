/**
* Copyright (C) 2017 Menome Technologies.
*
* Contains shared code for contacting the Neo4j Database.
*/
var neo4j = require('neo4j-driver').v1;
var conf = require('./config');
var uuidV4 = require('uuid/v4');

var driver = neo4j.driver(conf.neo4j.url, neo4j.auth.basic(conf.neo4j.user, conf.neo4j.pass));

module.exports = {
  query,
  genUuid: uuidV4,
  closeDriver: closeDriver
}

// Generic way for app to schedule queries, while getting passed any errors.
// Accepts a callback cb(err,result)
function query(queryStr, queryParams, cb) {
  if(!driver) driver = neo4j.driver(conf.neo4j.url, neo4j.auth.basic(conf.neo4j.user, conf.neo4j.pass));
  
  var session = driver.session();
  return session
    .run(queryStr, queryParams)
    .then(function (result) {
      session.close();
      if(!!cb) cb(null, result);
      return result;
    })
    .catch(function (err) {
      session.close();
      if(!!cb) cb(err, null);
      throw err;
    });
};

function closeDriver() {
 if(driver) driver.close();
 driver = undefined;
}