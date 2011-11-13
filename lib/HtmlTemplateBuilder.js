var html5 = require('./html5');
var TemplateBuilder = require('./TemplateBuilder');

module.exports = HtmlTemplateBuilder;

function HtmlTemplateBuilder() {
  this.template = new TemplateBuilder();
}

HtmlTemplateBuilder.prototype = {
  append : function (token) {
    
  },
  
  toString : function () {
    return this.template.toString();
  }
};
