var parser = require('../lib/parser');

[
  {
    // parse character references in 2nd stage
    source: 'foo & bar &amp; fubar'
  },
  {
    // null characters are illegal in data elements
    source: 'foo\0bar',
    error: true
  },
  {
    source: '<img id="icon" src="http://google.com/favicon.ico">'
  },
  {
    source: '<中国:Nonsense 义勇军进行曲="Random characters I got from somewhere">'
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
        //console.log(result);
        assert.equal(test.source, result.join(""));
      } catch (e) {
        test.error || console.log(e.toString());  // debug helper
        throw e;  // re-throw
      }
    });
    assert.done();
  };
  
});
