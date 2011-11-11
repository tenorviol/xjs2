var parser = require('./parser');
var tokens = require('./tokens');

exports.interpret = interpret;

function interpret(source) {
  var parse = parser.parse(source);
  var code = [];
  parse.forEach(function (token) {
    pushToken.call(code, token);
  });
  return code;
}

function pushToken(token) {
  switch (token.type) {
    case tokens.StartTag:
      token.attributes.forEach(function (attribute) {
        validateAttributeValue(attribute.value);
      });
      this.push('out.raw(' + JSON.stringify(token.source) + ');');
      break;
    case tokens.DOCTYPE:
    case tokens.EndTag:
    case tokens.Data:
    case tokens.Comment:
      this.push('out.raw(' + JSON.stringify(token.source) + ');');
      break;
    case tokens.ScriptTag:
    case tokens.StyleTag:
      this.push('out.raw(' + JSON.stringify('<' + token.name + joinSources(token.attributes) + '>') + ');',
                'out.state = "' + token.name + '";');
      var self = this;
      token.inner.forEach(function (inner) {
        pushToken.call(self, inner);
      });
      this.push('out.raw("</' + token.name + '>");',
                'out.state = "Data";');
      break;
    case tokens.CDATA:
      this.push('out.raw("<![CDATA[");',
                'out.state = "CDATA";');
      var self = this;
      token.inner.forEach(function (inner) {
        pushToken.call(self, inner);
      });
      this.push('out.raw("]]>");',
                'out.state = "Data";');
      break;
    case tokens.PIjs:
      this.push(token.script);
      break;
    case tokens.PIout:
      this.push("out.write(" + token.script + ");");
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
