/**
 * Copyright (c) Menome Technologies Inc.
 * 
 * For holding and validating JSON Schemas
 */
"use strict";
var Ajv = require('ajv');

// Validate data against a schema.
module.exports.validate = function(schema, data) {
  var thisSchema = schema;
  if(typeof thisSchema === 'string') thisSchema = module.exports.schemas[schema];
  if(!thisSchema) throw new Error("Schema does not exist.");
  var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true} 
  var validateMessage = ajv.compile(thisSchema);
  validateMessage(data);
  return validateMessage.errors;
}

module.exports.schemas = {
  harvesterMessage: {
    "$schema":"http://json-schema.org/draft-06/schema#",
    "title": "harvesterMessage",
    "type": "object",
    "required": ["NodeType","ConformedDimensions"],
    "additionalProperties": false,
    "properties": {
      "Name": {
        "type": "string"
      },
      "NodeType": {
        "type": "string",
        "pattern": "^[a-zA-Z0-9_]*$"
      },
      "Label": { // If this is set, don't make this a card. Make it something else. (eg. a Facet)
        "type": "string",
        "pattern": "^[a-zA-Z0-9_]*$"
      },
      "SourceSystem": {
        "type": "string",
        "pattern": "^[a-zA-Z0-9_\\s.'&]*$"
      },
      "ConformedDimensions": {
        "type": "object",
        "minProperties": 1,
      },
      "Properties": {
        "type": "object"
      },
      "DeleteNode": { // If true, just finds this node based on conformed dimensions and detach-deletes it.
        "type": "boolean"
      },
      "DeleteProperties": { // Properties listed here will be deleted from the nodes.
        "type": "array",
        "items": {
          "type": "string",
          "pattern": "^[a-zA-Z0-9_\\s.'&]*$"
        }
      },
      "Connections": { // Basically an array of the same things, minus second-level connections
        "type": "array",
        "items": {
          "type": "object",
          "required": ["NodeType","RelType","ForwardRel","ConformedDimensions"],
          "additionalProperties": false,
          "properties": {
            "Name": {
              "type": "string",
            },
            "NodeType": { // Primary type of node.
              "type": "string",
              "pattern": "^[a-zA-Z0-9_]*$"
            },
            "Label": { // If this is set, don't make this a card. Make it something else.
              "type": "string",
              "pattern": "^[a-zA-Z0-9_]*$"
            },
            "ForwardRel": { // True if we're going (node)-[]->(node2). False if (node)<-[]-(node2)
              "type": "boolean"
            },
            "RelType": {
              "type": "string",
              "pattern": "^[a-zA-Z0-9_]*$"
            },
            "ConformedDimensions": {
              "type": "object",
              "minProperties": 1
            },
            "Properties": {
              "type": "object"
            },
            "DeleteProperties": { // Properties listed here will be deleted from the node.
              "type": "array",
              "items": {
                "type": "string",
                "pattern": "^[a-zA-Z0-9_\\s.'&]*$"
              }
            },
            "RelProps": {
              "type": "object"
            },
            "DeleteRelProps": { // Properties listed here will be deleted from the relationship.
              "type": "array",
              "items": {
                "type": "string",
                "pattern": "^[a-zA-Z0-9_\\s.'&]*$"
              }
            },
            "DeleteRelationship": { // If true, just deletes this relationship if it exists.
              "type": "boolean"
            },
            "DeleteNode": { // If true, just finds this node based on conformed dimensions and detach-deletes it.
              "type": "boolean"
            }
          }
        }
      },
      "Priority": {
        "type": "number",
        "minimum": 0
      }
    }
  },
  botState: {
    "$schema":"http://json-schema.org/draft-06/schema#",
    "required": ["state"],
    "additionalProperties": false,
    "properties": {
      "state": {
        "type": "string",
        "enum": ["idle","initializing","working","failed"]
      },
      "message": {
        "type": "string"
      },
      "progressPercent": {
        "type": "number"
      }
    }
  },
  endpointMetadata: {
    "$schema":"http://json-schema.org/draft-06/schema#",
    "required": ["name","path","method","desc"],
    "properties": {
      "name": {
        "type": "string"
      },
      "method": {
        "type": "string",
        "enum": ["GET","POST","PUT","OPTIONS","DELETE"]
      },
      "path": {
        "type": "string"
      },
      "desc": {
        "type": "string"
      },
      "body": {
        "type": "boolean"
      },
      "params": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["name","desc"],
          "properties": {
            "name": {
              "type": "string",
            },
            "desc": {
              "type": "string",
            }
          }
        }
      }
    }
  }
}
