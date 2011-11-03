var interpreter = require('../lib/interpreter');
var tests = require('./tests');

tests.forEach(function (test) {
  if (!test.tokens) {
    return;
  }
  
  exports[test.source] = function (assert) {
    var result = interpreter.interpret(test.source);
    assert.done();
  };
  
});
