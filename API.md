# Bot Framework API

Bot Framework API documentation lives here.

## logger(message)

The bot surfaces some convenient logging methods. Call them in the same way you would call `console.log` or `console.error`

**Example**
```javascript
bot.logger.info("This is an info message!")
bot.logger.error("This is an error message!")
```

## configure(config)

Before the bot can be used, it must be configured. This is done by passing a configuration object into this function.

Calling this will also initialize the RabbitMQ and Neo4j clients, if configuration enables them.

**Parameters**
* conf: A configuration object. See [here](./README.md#configuration) for more information.

**Example**
```javascript
bot.configure({
  "name": "My Harvester Bot",
  "desc": "Harvests data from my Email",
  "logging": true,
  "port": 9001,
  "rabbit": {
    "enable": true,
    "url": "amqp://rabbitmq:rabbitmq@somerabbitserver:5672?heartbeat=3600",
    "routingKey": "syncevents.personal.information.invasion",
    "exchange": "syncevents",
    "exchangeType": "topic"
  }
})
```

## registerEndpoint(metadata,handler)

By default, bots support two methods: `GET /` and `GET /status`. The former gives a description of the bot and all its registered endpoints. The latter gets the current state of the bot. (Whether it's idle, processing with some measure of progress, or in a failed state.)

**Parameters**
* metadata: An object container a name, description, HTTP method, and server path for the method.
* handler: An expressjs-style middleware function that handles the call.

**Example**
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

## start()
Start the bot framework. This will start the webservice endpoints and connect to rabbit (if configured).
Make sure to register all endpoints and create all rabbit subscriptions before calling this.

**Example**
```javascript
// Takes no arguments. Just start the bot.
bot.start()
```

## rabbitSubscribe(queueName, handler, schema)
Allow the user to create a queue and subscribe to a message. handleMessage should be a function that takes a message and returns a promise. The promise should be falsy if we want to nack the message without requeue. Should throw an exception if we want to nack and requeue it.

**Parameters**
* queueName: the name of the Rabbit Queue this will declare.
* handler: A function for handling messages. Messages will be serialized into javascript objects. This should return a promise. Truthy if successful, falsy to NACK the message without requeueing. If an error is thrown, the message will be NACKed and requeued.
* schema: Optional. The message schema to validate against. This can be a JSON schema object, or the name of a schema bundled with the bot framework. Messages will be rejected if they fail this validation.

**Example**
```javascript
bot.rabbitSubscribe('testqueue',function(msg) {
  // Run some logic here.
},'harvesterMessage')
```

## rabbitPublish(msg, schema)
Allow the user to publish to rabbitmq. (with the routing key and exchange configured.)

**Parameters**
* msg: The message to publish. It will be serialized to JSON.
* schema: Optional. This can be a JSON schema object, or the name of a schema bundled with the bot framework. Throws an error if the message does not match the schema.

**Example**
```javascript
bot.rabbitPublish({"test": true})
```

## query(query,params,cb)
Run a neo4j Query. Returns a promise that gives the result of the query. Can optionally accept a callback function if you're into that style

**Parameters**
* query: A string representation of the cypher query.
* params: A dictionary of cypher query parameters.
* cb: Callback function. Optional. Can be used instead of promise. Called as cb(err,result). 

**Example**
```javascript
bot.query("MATCH (n) WHERE n.prop = {prop} RETURN n LIMIT 25",{prop: "value"}).then((result) => {
  // Do stuff with result
}).catch((err) => {
  // Do stuff with error.
})
```

## changeState(newState)

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