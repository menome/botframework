/*
 * Copyright (C) 2017 Menome Technologies Inc.
 *
 * Helper functions for bots.
 */
"use strict";

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
// Output: A UNIX epoch date. Or the input string if conversion failed.
module.exports.convertDate = function(date) {
  if(date instanceof Date) return date.getTime();
  if(typeof date !== 'string') return date;
  if(!isNaN(Number(date))) return date; // If it's just a number don't try to parse as a date.

  var parsed = Date.parse(date);
  if(isNaN(parsed) === false) return parsed;
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
