
// TODO: concat adjacent raws
// TODO: eliminate inconsequential state changes (e.g. state change, raw output, state change)
// TODO: try catch with line no. adjustment (or just put on correct line?)

module.exports = TemplateBuilder;

function TemplateBuilder() {
  this.script = [];
}

TemplateBuilder.prototype = {
  appendRaw : function (raw) {
    this.script.push('out.raw(' + JSON.stringify(raw) + ');');
  },
  
  appendPIjs : function (js) {
    this.script.push(js);
  },
  
  appendPIout : function (js) {
    // push typeof check, out strings and other, nothing for null and undefined, functions treated as (out, ..), etc.
    this.script.push('out.write(' + js + ');');
  },
  
  appendStateChange : function (state) {
    this.script.push('out.state = ' + JSON.stringify(state) + ';');
  },
  
  toString : function () {
    return this.script.join('\n');
  }
};
