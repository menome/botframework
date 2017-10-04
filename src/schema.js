/**
 * For holding and validating JSON Schemas
 */
var Ajv = require('ajv');

//TODO: More robust way to manage and use schemas (We're currently using magic strings.)

// Validate
module.exports.validate = function(schema, data) {
  var thisSchema = module.exports.schemas[schema];
  if(!thisSchema) throw new Error("Schema does not exist.");
  var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true} 
  var validateMessage = ajv.compile(thisSchema);
  validateMessage(data);
  return validateMessage.errors;
}

module.exports.schemas = {
  harvesterMessageSchema: {
    "$schema":"http://json-schema.org/draft-06/schema#",
    "title": "harvesterMessageSchema",
    "type": "object",
    "required": ["Name","NodeType","ConformedDimensions"],
    "additionalProperties": false,
    "properties": {
      "Name": {
        "type": "string"
      },
      "NodeType": {
        "type": "string",
        "pattern": "^[a-zA-Z0-9_]*$"
      },
      "SourceSystem": {
        "type": "string",
        "pattern": "^[a-zA-Z0-9_\\s\.\'&]*$"
      },
      "ConformedDimensions": {
        "type": "object",
        "minProperties": 1,
      },
      "Properties": {
        "type": "object"
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
            "NodeType": {
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
            "RelProps": {
              "type": "object"
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
  }
}