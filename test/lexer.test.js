var lexer = require('../lib/lexer');
var tests = require('./tests');

tests.forEach(function (test) {
  
  exports[test.source] = function (assert) {
    var toThrowOrNot = test.tokens ? "doesNotThrow" : "throws";
    assert[toThrowOrNot](function () {
      try {
        var result = lexer.parse(test.source);
        //console.log(result);
        assert.equal(test.source, joinSources(result));
        assert.deepEqual(test.tokens, result);
      } catch (e) {
        test.tokens && console.log(e.toString());  // debug helper
        throw e;  // re-throw
      }
    });
    assert.done();
  };
  
});

function joinSources(objects) {
  var source = '';
  objects.forEach(function (object) {
    source += object.source;
  });
  return source;
}
