var parser = require('../lib/parser');

[
  {
    source: 'foo'
  },
  {
    source: 'Dave &amp; Busters'
  },
  {
    source: 'Dave & Busters',
    error: true
  },
  {
    source: '<img src="http://google.com/favicon.ico"> Google'
  },
  {
    source: '<div id="foo">bar</div>'
  },
  {
    source: '<!DOCTYPE html>\n<html><head></head>\n<body></body></html>'
  },
  {
    source: '<script>foo < bar;</script>'
  },
  {
    source: '<style>jeremiah: "candy"</style>'
  }
].forEach(function (test) {
  
  exports[test.source] = function (assert) {
    var toThrowOrNot = test.error ? "throws" : "doesNotThrow";
    assert[toThrowOrNot](function () {
      try {
        var result = parser.parse(test.source);
        console.log(result);
        assert.equal(test.source, result.join(""));
      } catch (e) {
        test.error || console.log(e.toString());  // debug helper
        throw e;  // re-throw
      }
    });
    assert.done();
  };
  
});
