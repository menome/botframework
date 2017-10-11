var assert = require('chai').assert;
var mock = require('mock-require');
var simple = require('simple-mock');
var amqp = require('amqplib');
mock('amqplib', amqp); // Mock the neo4j driver.
var rabbit = require('../src/rabbit')
var logger = require('../src/logger');
logger.logging = false;

describe('RabbitMQ', function () {
  after(()=>{mock.stopAll()})
  afterEach(function() {
    simple.restore();
  });

  it('Connects to RabbitMQ', function (done) {
    simple.mock(amqp, 'connect', () => {
      return Promise.resolve({
        on: () => {},
        createChannel: () => {
          return Promise.resolve({
            assertExchange: () => {return Promise.resolve(true)}
          })
        }
      })
    })
    
    var rabbitClient = new rabbit({
      url: 'url',
      routingKey: 'key',
      exchange: 'exchange',
      exchangeType: 'exchangeType'
    });
    rabbitClient.connect();

    assert.equal(amqp.connect.callCount,1)

    rabbitClient.disconnect();
    done();
  });

});