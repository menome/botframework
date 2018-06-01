/*
 * Copyright (C) 2017 Menome Technologies Inc.
 *
 * Helper functions for bots.
 */
"use strict";
const path = require("path");
const fs = require("fs");

/**
 * Saves us time explicitly mapping columns to node properties.
 * excludecols is an array of strings. These columns will not be included as parameters.
 * Use this when we want to exclude properties from the node 
 * (eg. foreign keys, or properties we want to rename/do some more logic on.)
 */
module.exports.parseProps = function(row, excludeCols) {
  if(!excludeCols) excludeCols = [];
  var retVal = {};
  
  for(var property in row) {
    if(row.hasOwnProperty(property) && excludeCols.indexOf(property) === -1) {
      retVal[property] = row[property];
      if(typeof retVal[property] === 'string')
        retVal[property] = retVal[property].trim();
    }
  }

  return retVal;
}

/**
 * Get Swagger Paths from a directory full of controller modules.
 * 
 * @param {string} pathDir Absolute path of the directory in which we find controller modules.
 * @returns JSON object of Swagger Paths.
 */
module.exports.getSwaggerPaths = function(pathDir) {
  var swaggerPaths = { }

  // Loader. So we don't have to individually require each file.
  fs.readdirSync(pathDir).forEach(function(file) {
    swaggerPaths = Object.assign(swaggerPaths,require(path.join(pathDir, file)).swaggerDef)
  });

  return swaggerPaths;
}

// Returns a backwards compatible endpoint structure from the swagger def.
// Deprecate this when the controller bot is rewritten to consume swagger.
module.exports.transformSwagger = function(swaggerDef) {
  var paths = [];
  Object.keys(swaggerDef.paths).forEach((path) => {
    var pathdefs = swaggerDef.paths[path];
    Object.keys(pathdefs).forEach((operation) => {
      var opBody = pathdefs[operation];
      if(['get','post','delete','options','put'].indexOf(operation) === -1) return;

      paths.push({
        name: opBody.summary || path,
        path: path,
        desc: opBody.description || "No Description",
        method: operation.toUpperCase(),
        params: opBody.parameters ? opBody.parameters.map((param) => {
          return {name: param.name, desc: param.description}
        }) : undefined
      })
    })
  })
  return paths
}

// This attempts to convert values into epoch time dates.
// Input: A string.
// Output: An ISO8601 Date, or the input if it can't parse the value as a date.
module.exports.convertDate = function(date) {
  if(date === null) return undefined;
  if(date instanceof Date) return date.toISOString();
  if(typeof date !== 'string') return date;
  
  var parsed = Date.parse(date);
  if(isNaN(parsed) === false) return new Date(date).toISOString();
  else return date;
}

module.exports.responseWrapper = function({status, message, ...args}) {
  if(!status) status = "success";
  if(!message) throw new Error("API responses must contain a message.")

  if(['success','failure'].indexOf(status) === -1)
    throw new Error("Invalid status on message.")

  return {
    ...args,
    status: status,
    message: message
  }
}
