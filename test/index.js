var assert = require('chai').assert;
var mock = require('mock-require');
var simple = require('simple-mock');
var httpMock = require('http')
// var neo4jClient = require('../src/neo4j')
// var rabbitClient = require('../src/rabbit')

describe('Main App', function () {
  var queryStub = simple.stub();
  var connectStub = simple.stub();
  var neo4jMock = simple.spy(() => {
    return {
      query: queryStub
    }
  })
  var rabbitMock = simple.spy(() => {
    return {
      connect: connectStub
    }
  });
  var bot;
  var listenStub;

  before(()=>{
    mock.stopAll()
    listenStub = simple.stub()
    simple.mock(httpMock, 'createServer', simple.spy(() => {
      return {
        listen: listenStub
      }
    }))
    mock('http', httpMock);
    mock('../src/neo4j', neo4jMock);
    mock('../src/rabbit', rabbitMock);
    bot = require('../index');
  })

  after(()=>{
    mock.stopAll()
  })

  // afterEach(function() {
  //   simple.restore();
  // });

  it('Merges Configuration', function () {
    var thisConfig = {
      logging: false,
      port: 2048,
      rabbit: {enable: true},
      neo4j: {enable: true}
    }

    // Configure the bot.
    bot.configure(thisConfig)
    
    // Ensure we've initialized the components we enabled.
    assert.equal(neo4jMock.callCount,1)
    assert.equal(rabbitMock.callCount,1)

    // Check merged config.
    assert.equal(bot.config.logging,thisConfig.logging)
    assert.equal(bot.config.port,thisConfig.port)
    assert.equal(bot.config.rabbit.enable,thisConfig.rabbit.enable)
    assert.equal(bot.config.neo4j.enable,thisConfig.neo4j.enable)
    assert.equal(bot.config.neo4j.url,'bolt://localhost') // To make sure we merged with defaults
  });

  it('Can Change Bot State to valid state', function () {
    // Configure the bot.
    var newState = bot.changeState({
      state: "working",
      message: "Test Message"
    })
    
    assert.equal(newState.state,"working");
    assert.equal(newState.message,"Test Message");
  });

  it('Can\'t Change Bot State to invalid state', function () {
    // Configure the bot.
    var newState = bot.changeState({
      state: "asdf",
      message: true,
      disallowedProp: "Why is this here?"
    })
    
    assert.equal(newState,false);
  });

  it('Can register a new endpoint', function () {
    // Configure the bot.
    var endpointMeta = {
      "name": "Test",
      "path": "/test",
      "method": "GET",
      "desc": "Test Endpoint."
    }
    var operations = bot.registerEndpoint(endpointMeta, simple.stub())
    
    assert.oneOf(endpointMeta,operations);
  });

  it('Bot Starts', function () {
    // Configure the bot.
    bot.start();
    
    // Have we started the webserver?
    assert.equal(httpMock.createServer.callCount,1)
    assert.equal(listenStub.callCount,1)

    // Have we started listening to Rabbit?
    assert.equal(rabbitMock().connect.callCount,1)
  });
});