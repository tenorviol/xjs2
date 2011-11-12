
// TODO: concat adjacent raws
// TODO: eliminate inconsequential state changes (e.g. state change, raw output, state change)

module.exports = TemplateBuilder;

function TemplateBuilder() {
  this.script = [];
}

TemplateBuilder.prototype = {
  addRaw : function (raw) {
    this.script.push('out.raw(' + JSON.stringify(raw) + ');');
    //var length = this.script.length;
    //if (length && this.script[length-1] instanceof Raw) {
    //  this.script[length-1].append(raw);
    //} else {
    //  this.script.push(new Raw(raw));
    //}
  },
  
  addPIjs : function (js) {
    // TODO: try catch line adjustment (or just put on correct line)
    this.script.push(js);
  },
  
  addPIout : function (js) {
    // push typeof check, out strings and other, nothing for null and undefined, functions treated as (out, ..), etc.
    this.script.push('out.write(' + js + ');');
  },
  
  addSetState : function (state) {
    this.script.push('out.state = ' + JSON.stringify(state) + ';');
  },
  
  toString : function () {
    return this.script.join('\n');
  }
};

function Raw(text) {
  this.text = [text];
}

Raw.prototype = {
  append : function (text) {
    this.text.push(text);
  },
  
  toString : function () {
    return 'out.raw(' + JSON.stringify(this.text.join('')) + ');';
  }
};
