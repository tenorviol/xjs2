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
      builder.addRaw(token.source);
      break;
    case tokens.DOCTYPE:
    case tokens.EndTag:
    case tokens.Data:
    case tokens.Comment:
      builder.addRaw(token.source);
      break;
    case tokens.ScriptTag:
    case tokens.StyleTag:
      builder.addRaw('<' + token.name + joinSources(token.attributes) + '>');
      builder.addSetState(token.name);
      var self = this;
      token.inner.forEach(function (inner) {
        addToken(builder, inner);
      });
      builder.addRaw('</' + token.name + '>');
      builder.addSetState("Data");
      break;
    case tokens.CDATA:
      builder.addRaw("<![CDATA[");
      builder.addSetState("CDATA");
      var self = this;
      token.inner.forEach(function (inner) {
        addToken(builder, inner);
      });
      builder.addRaw("]]>");
      builder.addSetState("Data");
      break;
    case tokens.PIjs:
      builder.addPIjs(token.script);
      break;
    case tokens.PIout:
      builder.addPIout(token.script);
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
