# Menome Bot Framework

[View the full API Doc here](./API.md)

[View an example bot here](https://github.com/menome/harvesterTemplate)

[View the schemas here](./helpers/schema.js)

This package contains a common framework for all bots that integrate with theLink or the Menome stack.

Bots commonly have the following functionality:
* Can Connect to RabbitMQ and send + receive messages with routing keys.
* Be able to connect to and run queries on the Neo4j graph.
* Can describe themselves, their functionality, and their state via API calls.
  * eg. A harvester bot should be able to tell us, via REST calls, that it has a /sync endpoint, or that performing a GET on /status gives the progress of the current sync job.

## Usage
To use the framework, just follow these steps:

1. Import the framework
2. Instantiate a bot. (Use `var bot = new Bot({config, configSchema})`) [(See Below)](#configuration)
3. Configure Swagger Endpoints [(See Below)](#register-web-endpoints)
4. Start the bot by calling `bot.start()`
5. Set the bot's initial state with `bot.changeState({state: "idle"})`

For a complete list of functions that you can utilize, see the [API Docs](./API.md)

## Configuration

Configuration is specified in the following structure: (Default values shown)
```json
{
  "name": "SQL Harvester",
  "desc": "Harvests from something",
  "nickname": "World Database Harvester",
  "urlprefix": "/",
  "logging": true,
  "port": 80,
  "rabbit": {
    "enable": false,
    "url": "amqp://rabbitmq:rabbitmq@rabbit:5672?heartbeat=3600",
    "routingKey": "syncevents.harvester.updates.example",
    "exchange": "syncevents",
    "exchangeType": "topic"
  },
  "neo4j": {
    "enable": false,
    "url": "bolt://localhost",
    "user": "neo4j",
    "pass": "password"
  },
  "ssl": {
    "enable": false,
    "certpath": "/srv/app/ssl/cert.pem",
    "keypath": "/srv/app/ssl/key.pem",
    "port": 443
  }
}
```

Configuration is handled through [Mozilla Convict](https://github.com/mozilla/node-convict). For more information on our baseline config structure, see [the config schema](./bot/config.js).

When creating a new bot, call the constructor and supply an object like the one above as a config parameter. 

Additionally, you can specify a `configSchema`. This will be merged in with the default bot schema for when you want to supply your own configuration parameters.

For example, this would set up a new bot with some custom config parameters.

```javascript
var bot = require('@menome/botframework')

var config = {
  name: "JSON Placeholder Bot",
  desc: "Harvests data from JSON placeholder.",
  nickname: "Jerry",
  // (Add some additional config params for rabbit, neo4j, ports in use, etc)
}

var configSchema = {
  url: {
    doc: "The URL of the REST Endpoint we're grabbing",
    format: "url",
    default: "https://jsonplaceholder.typicode.com",
    env: "API_URL"
  }
}

var bot = new Bot({ config, configSchema });
```

## Register Web Endpoints

The Bot Framework is built to be OpenAPI compliant. Navigate to the `[bot address]/docs` to view the bot's OpenAPI spec through the swagger UI

To register additional endpoints, you must call `bot.registerPaths(paths, controllersDir);`.

An easy way to sed this up is to have a subdirectory called 'controllers' in which you put your controllers and their swagger stubs. A file in this directory might look like this:

```javascript
// controllertest.js
module.exports.swaggerDef = {
  "/ping": {
    "x-swagger-router-controller": "controllertest",
    "get": {
      "tags": [
        "JSONPlaceholder"
      ],
      "responses": {
        "200": { "description": "Success" },
        "default": { "description": "Error" }
      }
    }
  }
}

module.exports.get = function(req,res) {
  return res.send({message: "Pong!"});
}
```

To load these and register them with the bot, you can do something like this:

```javascript
var path = require('path');

bot.registerControllers(path.join(__dirname,"./controllers"));
bot.start())
```

For more information on OpenAPI and Swagger, read their documentation [here](https://swagger.io/specification/).