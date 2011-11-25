var fs = require('fs');
var interpreter = require('./lib/interpreter');
var compiler = require('./lib/compiler');

exports.template = template;

function template(filename) {
  var source = fs.readFileSync(filename, 'utf8');
  var script = interpreter.interpret(source);
  var template = compiler.compile(script, filename);
  return template;
}
