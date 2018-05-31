var assert = require('chai').assert;
var helpers = require('../helpers');

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

describe('responsewrapper', function() {
  it('Can create a valid response message', function () {
    var message = helpers.responseWrapper({
      status: "success",
      message: "Sample Message",
      otherKey: "Other key"
    })

    assert.containsAllKeys(message,['status','message','otherKey'])
  });

  it('Can create a valid response message', function () {
    var message = helpers.responseWrapper({
      status: "success",
      message: "Sample Message",
      otherKey: "Other key"
    })

    assert.containsAllKeys(message,['status','message','otherKey'])
  });

  it('Can not create an invalid response message', function () {
    assert.throws(helpers.responseWrapper.bind({
      message: "Sample Message",
      otherKey: "Other key"
    }), Error)
  });
})

describe('convertDate', function () {
  it('Passes non-date parameters through.', function () {
    var notDates = [
      "asdf",
      21.5,
      "21.5",
      null,
      true
    ]
    notDates.forEach((itm) => {
      assert.equal(itm, helpers.convertDate(itm));
    })
  });

  it('Converts string dates', function () {
    var dates = [
      {val: "01 Jan 1970 00:00:00 GMT", timestamp: "1970-01-01T00:00:00.000Z" },
      {val: "04 Dec 1995 00:12:00 GMT", timestamp: "1995-12-04T00:12:00.000Z" },
      {val: "2015-03-25T12:00:00-06:30", timestamp: "2015-03-25T18:30:00.000Z" },
      {val: "10/15/2008 10:06:32 PM", timestamp: "2008-10-16T04:06:32.000Z" },
      {val: "2015-03-25 12:00:00.00", timestamp: "2015-03-25T18:00:00.000Z" },
      {val: "7/7/2011", timestamp: "2011-07-07T06:00:00.000Z" },
    ]

    dates.forEach((itm) => {
      assert.equal(helpers.convertDate(itm.val),itm.timestamp)
    })
  });

});

