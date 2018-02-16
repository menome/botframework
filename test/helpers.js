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

describe('convertDate', function () {
  it('Passes non-date parameters through.', function () {
    var notDates = [
      "asdf",
      21.5,
      "21.5",
      "12345",
      null,
      true
    ]
    notDates.forEach((itm) => {
      assert.equal(itm, helpers.convertDate(itm));
    })
  });

  it('Converts string dates', function () {
    var dates = [
      {val: "01 Jan 1970 00:00:00 GMT", timestamp: 0 },
      {val: "04 Dec 1995 00:12:00 GMT", timestamp: 818035920000 },
      {val: "2015-03-25T12:00:00-06:30", timestamp: 1427308200000 },
      {val: "10/15/2008 10:06:32 PM", timestamp: 1224129992000 },
      {val: "2015-03-25 12:00:00.00", timestamp: 1427306400000 },
      {val: "7/7/2011", timestamp: 1310018400000 },
    ]

    dates.forEach((itm) => {
      assert.equal(helpers.convertDate(itm.val),itm.timestamp)
    })
  });
});