var fs = require('fs');
var interpreter = require('./lib/interpreter');
var compiler = require('./lib/compiler');

exports.template = template;
exports.render = render;

// load and compile an xjs template
// TODO: cache and reload on file change
//
//      @param string filename xjs template
//      @return function(out, globals) template function
//      @throws
function template(filename) {
  var source = fs.readFileSync(filename, 'utf8');
  var script = interpreter.interpret(source);
  var template = compiler.compile(script, filename);
  return template;
}

// create middleware function that responds using an xjs template
// TODO: buffer
// TODO: handle template exceptions
// TODO: reload templates on file change (development only)
//
//      @param string filename xjs template
//      @param object globals available variables in the template
//      @throws
function render(filename, globals) {
  globals = globals || {};
  var template = exports.template(filename);
  return function (req, res, next) {
    var context = {
      req: req,
      res: res
    };
    for (var i in context) {
      context[i] = globals[i];
    }
    template(res, context);
  };
}
