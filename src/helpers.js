/**
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