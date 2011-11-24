var html5 = require('./html5');
var tokens = require('./tokens');
var TemplateBuilder = require('./TemplateBuilder');

module.exports = HtmlTemplateBuilder;

function HtmlTemplateBuilder() {
  this.template = new TemplateBuilder();
}

HtmlTemplateBuilder.prototype = {
  append : function (token) {
    var self = this;
    switch (token.type) {
      case tokens.StartTag:
        token.attributes.forEach(function (attribute) {
          validateAttributeValue(attribute.value);
        });
        this.template.appendRaw(token.source);
        break;

      case tokens.DOCTYPE:
      case tokens.EndTag:
      case tokens.Data:
      case tokens.Comment:
        this.template.appendRaw(token.source);
        break;

      case tokens.ScriptTag:
      case tokens.StyleTag:
        this.template.appendRaw('<' + token.name + joinSources(token.attributes) + '>');
        this.template.appendStateChange(token.name);
        var self = this;
        token.inner.forEach(function (inner) {
          self.append(inner);
        });
        this.template.appendRaw('</' + token.name + '>');
        this.template.appendStateChange("Data");
        break;

      case tokens.CDATA:
        this.template.appendRaw("<![CDATA[");
        this.template.appendStateChange("CDATA");
        var self = this;
        token.inner.forEach(function (inner) {
          self.append(inner);
        });
        this.template.appendRaw("]]>");
        this.template.appendStateChange("Data");
        break;

      case tokens.PIjs:
        this.template.appendPIjs(token.script);
        break;

      case tokens.PIout:
        this.template.appendPIout(token.script);
        break;

      default:
        throw new Error("Unknown token type, '" + token.type + "'");
    }
  },
  
  toString : function () {
    return this.template.toString();
  }
};

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
