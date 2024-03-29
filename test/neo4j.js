var assert = require('chai').assert;
var mock = require('mock-require');
var simple = require('simple-mock');
var neo4jdriver = require('neo4j-driver');


describe('Neo4j', function () {
  console.log("Starting")
  var neo4j;
  before(() => {
    mock.stopAll()
    mock('neo4j-driver', neo4jdriver); // Mock the neo4j driver.mock.stopAll()
    neo4j = require('../neo4j')
  })
  after(()=>{mock.stopAll()})
  afterEach(function() {
    simple.restore();
  });
  
  it('Creates Driver', function () {
    simple.mock(neo4jdriver, 'driver');
    
    new neo4j({
      url: "bolt://localhost",
      user: "neo4j",
      pass: "password"
    });

    assert.equal(neo4jdriver.driver.callCount,1)    
  });

  it('Executes a query', function (done) {
    var session = {};
    simple.mock(session,"run",function() {
      return Promise.resolve("test");
    })
    simple.mock(session,"close")
    simple.mock(neo4jdriver, 'driver', function() {
      return {
        session: () => {
          return session;
        }
      }
    });

    var neo4jClient = new neo4j({
      url: "bolt://localhost",
      user: "neo4j",
      pass: "password"
    });
    
    simple.mock(neo4jdriver)

    var query = "MATCH (n) RETURN n limit 1"
    var params = {param: 1}
    neo4jClient.query(query,params).then((retVal) => {
      assert.equal(retVal,"test");
      assert.equal(session.run.callCount,1)
      assert.equal(session.run.lastCall.args[0], query)
      assert.equal(session.run.lastCall.args[1], params)
      done()
    }).catch((err)=>{done(err)})
  });
});