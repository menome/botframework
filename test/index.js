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
  var Bot;
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
    Bot = require('../index');
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
      nickname: "My Nickname",
      rabbit: {enable: true},
      neo4j: {enable: true},
      urlprefix: "/api"
    }

    // Configure the bot.
    bot = new Bot({config: thisConfig})

    // Check merged config.
    assert.equal(bot.config.get('logging'),thisConfig.logging)
    assert.equal(bot.config.get('port'),thisConfig.port)
    assert.equal(bot.config.get('rabbit').enable,thisConfig.rabbit.enable)
    assert.equal(bot.config.get('neo4j').enable,thisConfig.neo4j.enable)
    assert.equal(bot.config.get('urlprefix'), thisConfig.urlprefix)
    assert.equal(bot.config.get('nickname'), thisConfig.nickname)
    assert.equal(bot.config.get('neo4j.url'),'bolt://localhost') // To make sure we merged with defaults
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

  it('Bot Starts', function () {
    // Configure the bot.
    bot.start();
    
    // Have we started the webserver?
    assert.equal(httpMock.createServer.callCount,1);
    assert.equal(listenStub.callCount,1);
  });
});