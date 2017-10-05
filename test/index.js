var assert = require('chai').assert;
var mock = require('mock-require');
var simple = require('simple-mock');
var http = require('http');
// var neo4jClient = require('../src/neo4j')
// var rabbitClient = require('../src/rabbit')

describe('Main App', function () {
  var neo4jMock = simple.stub();
  var rabbitMock = simple.stub();

  before(()=>{
    mock.stopAll()
    mock('http', http);
    mock('../src/neo4j', neo4jMock);
    mock('../src/rabbit', rabbitMock);
  })

  after(()=>{mock.stopAll()})

  afterEach(function() {
    simple.restore();
  });

  it('Merges Configuration', function () {
    var bot = require('../index')

    var thisConfig = {
      logging: false,
      port: 2048,
      rabbit: {enable: true},
      neo4j: {enable: false}
    }

    bot.configure(thisConfig)
    
    // Ensure we've initialized the components we enabled.
    assert.equal(neo4jMock.callCount,0)
    assert.equal(rabbitMock.callCount,1)

    // Check merged config.
    assert.equal(bot.config.logging,thisConfig.logging)
    assert.equal(bot.config.port,thisConfig.port)
    assert.equal(bot.config.rabbit.enable,thisConfig.rabbit.enable)
    assert.equal(bot.config.neo4j.enable,thisConfig.neo4j.enable)
    assert.equal(bot.config.neo4j.url,'bolt://localhost') // To make sure we merged with defaults
  });

});