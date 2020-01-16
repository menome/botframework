# Bot Framework API

Bot Framework API documentation lives here.

## Class: Bot({config, configSchema})

Creates a new bot.
If configured, a Neo4j object, logger object, and RabbitMQ object can all be accessed via
`bot.neo4j`, `bot.rabbit`, and `bot.logger`.

**Parameters**
* config: A configuration object. See [here](./README.md#configuration) for more information.
* configSchema: A Convict schema specification to merge into the main bot convict schema.

### bot.start()
Start the bot framework. This will start the webservice endpoints and connect to rabbit (if configured).
Make sure to register all endpoints and create all rabbit subscriptions before calling this.

**Example**
```javascript
// Takes no arguments. Just start the bot.
bot.start()
```

### bot.changeState(newState)
**deprecated**
All bots have a standard way of describing their state. It is up to the programmer to manage the state of their bot.

Valid states are: 'idle','initializing','working','failed' The application's state also optionally allows for a message and a percentage progress indicator.

**Parameters**
* newState: A state object that conforms to the state schema. 'state' is required. 'progressPercent' and 'message' are optional.

**Example**
```javascript
bot.changeState({state: 'working', progressPercent: 16.5});
bot.changeState({state: 'failed', message: "Database is unreachable"});
bot.changeState({state: 'idle'});
```

### bot.registerPaths(paths,controllerDir)

Configures the bot with additional swagger/openAPI defined endpoints.

**Parameters**
* paths: A JSON object that denotes swagger paths. See Swagger/OpenAPI documentation for more in-depth explanation.
* controllerDir: String. A directory in which to look for swagger controllers.

**Example**
```javascript
bot.registerPaths(paths,__dirname+'/controllers')
```

### bot.registerControllers(controllerDir)

Configures the bot with additional swagger/openAPI defined endpoints. Easier than the above.

**Parameters**
* controllerDir: String. Absolute path to a directory in which to look for swagger controllers.

**Example**
```javascript
bot.registerControllers(__dirname+'/controllers')
```

## Class: Logger()

The bot surfaces some convenient logging methods. Call them in the same way you would call `winston.log` or `winston.log('error|info', ...)`

**Example**
```javascript
bot.logger.log('level',"This is an info message!",{stuff:"things"})
bot.logger.info("This is an info message!")
bot.logger.error("This is an error message!")
```

## Class: Neo4j(config)

A class for interfacing with Neo4j Graph Database. If configured, an instance will be created within the bot, and can be accessed via `bot.neo4j`.

## neo4j.query(query,params,cb)

Run a neo4j Query. Returns a promise that gives the result of the query. Can optionally accept a callback function if you're into that style

**Parameters**
* query: A string representation of the cypher query.
* params: A dictionary of cypher query parameters.
* cb: Callback function. Optional. Can be used instead of promise. Called as cb(err,result). 

**Example**
```javascript
bot.neo4j.query("MATCH (n) WHERE n.prop = {prop} RETURN n LIMIT 25",{prop: "value"}).then((result) => {
  // Do stuff with result
}).catch((err) => {
  // Do stuff with error.
})
```

## neo4j.closeDriver()

Call this to cleanly close our driver, and any active connections to Neo4j.

## Class: Rabbit(config)

A class for cleanly interfacing with RabbitMQ. If configured, a bot will create an internal instance of this and manage connection state. This internal instance can be accessed via `bot.rabbit`.

## rabbit.addListener(queueName, handler, schema)
Allow the user to create a queue and subscribe to a message. handleMessage should be a function that takes a message and returns a promise. The promise should be falsy if we want to nack the message without requeue. Should throw an exception if we want to nack and requeue it.

**Parameters**
* queueName: the name of the Rabbit Queue this will declare.
* handler: A function for handling messages. Messages will be serialized into javascript objects. This should return a promise. Truthy if successful, falsy to NACK the message without requeueing. If an error is thrown, the message will be NACKed and requeued.
* schema: Optional. The message schema to validate against. This can be a JSON schema object, or the name of a schema bundled with the bot framework. Messages will be rejected if they fail this validation.

**Example**
```javascript
bot.rabbit.addListener('testqueue',function(msg) {
  // Run some logic here.
},'harvesterMessage')
```

## rabbit.publishMessage(msg, schema)
Allow the user to publish to rabbitmq. (with the routing key and exchange configured.)

**Parameters**
* msg: The message to publish. It will be serialized to JSON.
* schema: Optional. This can be a JSON schema object, or the name of a schema bundled with the bot framework. Throws an error if the message does not match the schema.

**Example**
```javascript
bot.rabbit.publishMessage({"test": true})
```
## rabbit.connect() 

Connect to the configured RabbitMQ host. Will continuously retry and renew the connection until `rabbit.disconnect()` is called.

## rabbit.disconnect()

Cleanly disconnect from the configured RabbitMQ host.