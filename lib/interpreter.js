var parser = require('./parser');
var tokens = require('./tokens');
var TemplateBuilder = require('./TemplateBuilder');

exports.interpret = interpret;

function interpret(source) {
  var parse = parser.parse(source);
  var builder = new TemplateBuilder();
  parse.forEach(function (token) {
    addToken(builder, token);
  });
  return builder.toString();
}

function addToken(builder, token) {
  switch (token.type) {
    case tokens.StartTag:
      token.attributes.forEach(function (attribute) {
        validateAttributeValue(attribute.value);
      });
      builder.appendRaw(token.source);
      break;
    case tokens.DOCTYPE:
    case tokens.EndTag:
    case tokens.Data:
    case tokens.Comment:
      builder.appendRaw(token.source);
      break;
    case tokens.ScriptTag:
    case tokens.StyleTag:
      builder.appendRaw('<' + token.name + joinSources(token.attributes) + '>');
      builder.appendStateChange(token.name);
      var self = this;
      token.inner.forEach(function (inner) {
        addToken(builder, inner);
      });
      builder.appendRaw('</' + token.name + '>');
      builder.appendStateChange("Data");
      break;
    case tokens.CDATA:
      builder.appendRaw("<![CDATA[");
      builder.appendStateChange("CDATA");
      var self = this;
      token.inner.forEach(function (inner) {
        addToken(builder, inner);
      });
      builder.appendRaw("]]>");
      builder.appendStateChange("Data");
      break;
    case tokens.PIjs:
      builder.appendPIjs(token.script);
      break;
    case tokens.PIout:
      builder.appendPIout(token.script);
      break;
    default:
      throw new Error("Unknown token type, '" + token.type + "'");
  }
}

function validateAttributeValue(value) {
  var from = 0;
  var loc;
  while ((loc = value.indexOf('&', from)) !== -1) {
    console.log(value.substr(loc));
    // TODO: all character references
    if (!(/^&(#[0-9]+|#x[0-9a-f]+|gt|lt|quot|amp);/.test(value.substr(loc)))) {
      throw new Error('Unknown character reference "' + value.substr(loc) + '"');
    }
  }
}

function joinSources(objects) {
  var source = '';
  objects.forEach(function (object) {
    source += object.source;
  });
  return source;
}
