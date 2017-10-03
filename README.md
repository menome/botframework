# Menome Bot Framework

This package contains a common framework for all bots that integrate with theLink or the Menome stack.

Bots should fundamentally have the following functionality.
* Can Connect to RabbitMQ and send + receive messages based on routing keys.
* Can describe themselves, their functionality, and their state via API calls.
  * eg. A harvester bot should be able to tell us, via REST calls, that it has a /sync endpoint, or that performing a GET on /status gives the progress of the current sync job.

## Configuration

Configuration can be specified either through environment variables, or through a JSON config file, located at config/conf.json.

Environment variables will always overwrite JSON configs. If neither are found, defaults will be loaded.

If your source system requires keys or other things, you'll need to manually add entries for them in the config. The `app/config.js` file should be fairly self explanatory

### Environment Variables:
```
RABBIT_URL=the URL of the RMQ server. eg. 'amqp://rabbitmq:rabbitmq@rabbit:5672?heartbeat=3600'
```

### Example JSON Configuration:
```
{
  "rabbit": {
    "url": "amqp://rabbitmq:rabbitmq@rabbit:5672?heartbeat=3600",
    "routingKey": "syncevents.harvester.updates",
    "exchange": "syncevents"
  }
}
```