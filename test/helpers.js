var assert = require('chai').assert;
var helpers = require('../src/helpers');

describe('ParseProps', function () {
  it('Parses Properties', function () {
    var row = {
      item1: "Value1",
      item2: true,
      item3: 21,
      item4: "excludeMe"
    }
    var parsed = helpers.parseProps(row,['item4'])
    assert.equal(parsed.item1,row.item1)
    assert.equal(parsed.item2,row.item2)
    assert.equal(parsed.item3,row.item3)
    assert.isUndefined(parsed.item4);
  });
});