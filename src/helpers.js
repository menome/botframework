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

// This attempts to convert values into epoch time dates.
// Input: A string.
// Output: A UNIX epoch date. Or the input string if conversion failed.
module.exports.convertDate = function(date) {
  if(typeof date !== 'string') return date;
  if(!isNaN(Number(date))) return date; // If it's just a number don't try to parse as a date.

  var parsed = Date.parse(date);
  if(isNaN(parsed) === false) return parsed;
  else return date;
}