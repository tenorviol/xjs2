var parser = require('./parser');

exports.interpret = interpret;

function interpret(source) {
  var parse = parser.parse(source);
  
}
