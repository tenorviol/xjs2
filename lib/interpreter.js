var parser = require('./parser');
var HtmlTemplateBuilder = require('./HtmlTemplateBuilder');

exports.interpret = interpret;

function interpret(source) {
  var parse = parser.parse(source);
  var builder = new HtmlTemplateBuilder();
  parse.forEach(function (token) {
    builder.append(token);
  });
  return builder.toString();
}
