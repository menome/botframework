# Menome Bot Framework

* [API Doc](./API.md)

This package contains a common framework for all bots that integrate with theLink or the Menome stack.

Bots should fundamentally have the following functionality.
* Can Connect to RabbitMQ and send + receive messages based on routing keys.
* Can describe themselves, their functionality, and their state via API calls.
  * eg. A harvester bot should be able to tell us, via REST calls, that it has a /sync endpoint, or that performing a GET on /status gives the progress of the current sync job.

## Usage
To use the framework, just follow these steps:
1. Import the framework
2. Call bot.configure() [(See Below)](#configuration)
3. Register web endpoints. [(See Below)](#register-web-endpoints)
4. (Optionally) Use bundled functionality [(See Below)](#bundled-functionality)
5. Write Bot Logic

## Configuration

Configuration is specified in the following structure: (Default values shown)
```json
{
  "name": "Unconfigured Harvester",
  "desc": "Harvests from something",
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
  }
}
```

To initialize the bot framework, call `bot.configure()` with a config structure similar to the one above as an argument. It will be merged with the default config where values are omitted. Alternatively the bot surfaces a built in schema for configuration via [Mozilla Convict](https://github.com/mozilla/node-convict). 

Here's an example of a configuration using convict. It grabs the config schemas from the bot framework, and adds an additional config parameter for use in the bot itself.
```javascript
var convict = require('convict');
var bot = require('menome-botframework')

// Define a schema
var config = convict({
  url: {
    doc: "The URL of the REST Endpoint we're grabbing",
    format: "url",
    default: "https://jsonplaceholder.typicode.com",
    env: "API_URL"
  },
  port: bot.configSchema.port,
  logging: bot.configSchema.logging,
  neo4j: bot.configSchema.neo4j,
  rabbit: bot.configSchema.rabbit,
});
config.validate({allowed: 'strict'});

bot.configure({
  name: "JsonPlaceholder harvester",
  desc: "Harvests from JSON Placeholder",
  logging: config.get('logging'),
  port: config.get('port'),
  rabbit: config.get('rabbit'),
  neo4j: config.get('neo4j')
})
```

## Register Web Endpoints

By default, bots support two methods: `GET /` and `GET /status`. The former gives a description of the bot and all its registered endpoints. The latter gets the current state of the bot. (Whether it's idle, processing with some measure of progress, or in a failed state.)

For the bot to actually do work, we need to add an endpoint to listen on. We can add an endpoint like so:

```javascript
bot.registerEndpoint({
  "name": "Synchronize",
  "path": "/sync",
  "method": "POST",
  "desc": "Starts a full synchronization from the source system."
}, function(req,res) {
  res.send("Starting the Harvest")
  // Run some sync logic.
})
```

## Bundled Functionality

### Publish to RabbitMQ

If you have configured RabbitMQ, you can publish a message on the configured exchange with the configured routing key as follows:

```javascript
bot.rabbitPublish({"message": "Hello"})
```
The second argument can be the name of a bundled schema. An error will be logged if you attempt to publish a message that does not pass the schema.

### Listen for RabbitMQ Messages

If you have configured RabbitMQ, you can declare a named queue with a message handler as follows:

```javascript
bot.rabbitSubscribe('testqueue',function(msg) {
  // Run some logic here.
  // This should return a promise. Truthy if successful, falsy to NACK the message without requeueing.
  // If an error is thrown, the message will be NACKed and requeued.
},'harvesterMessageSchema')
```
The second argument can be the name of a bundled schema. An error will be logged if you receive a message that does not pass the schema.

### Run Neo4j Queries

If you have enabled and configured Neo4j, you can run queries as follows:

```javascript
bot.query("MATCH (n) WHERE n.prop = {prop} RETURN n LIMIT 25",{prop: "value"}).then((result) => {
  // Do stuff with result
}).catch((err) => {
  // Do stuff with error.
})
```

### Log Events

The bot also comes with a logging wrapper. Currently it just spits a message to STDOUT but this central point allows us to implement logging logic down the road.

```javascript
bot.logger.error("Something went wrong");
```

### Update Application Status

All bots have a standard way of describing their state. It is up to the programmer to manage the state of their bot.

Valid states are: 'idle','initializing','working','failed' The application's state also optionally allows for a message and a percentage progress indicator.

Examples: 
```javascript
bot.changeState({state: 'working', progressPercent: 16.5});
bot.changeState({state: 'failed', message: "Database is unreachable"});
bot.changeState({state: 'idle'});
```