var interpreter = require('../lib/interpreter');
var tests = require('./tests');

tests.forEach(function (test) {
  if (!test.tokens) {
    return;
  }
  if (test.code === undefined) {
    return;
  }
  
  exports[test.source] = function (assert) {
    var toThrowOrNot = test.code ? "doesNotThrow" : "throws";
    assert[toThrowOrNot](function () {
      var result = interpreter.interpret(test.source);
      assert.equal(test.code.join('\n'), result);
    });
    assert.done();
  };
  
});
