var parser = require('./parser');

exports.interpret = interpret;

function interpret(source) {
  var parse = parser.parse(source);
  var code = [];
  parse.forEach(function (token) {
    if (token.type === 'Data') {
      code.push('out.raw(' + JSON.stringify(token.source) + ');');
    } else if (token.type === 'StartTag') {
      token.attributes.forEach(function (attribute) {
        validateAttributeValue(attribute.value);
      });
      code.push('out.raw(' + JSON.stringify(token.source) + ');');
    }
  });
  return code;
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
