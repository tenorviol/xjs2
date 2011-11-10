var vm = require('vm');
var module = require('module');
var path = require('path');
var XjsStream = require('../lib/XjsStream');

exports.compile = compile;

// Create an xjs function from javascript source
//
// @param string js source
// @param string filename
// @return function (out : Stream [, locals : object])
//
// The context available to the function will be
// similar to that of other node.js modules. An output
// stream has been added (`out`), and `module` and
// `module.exports` have been rmoved. All `locals`
// variables will be available in the global scope
// plus the following standard globals.
//
// NOTE: standard globals will overwrite locals of the same name
//
// #### out
//
// The ouput stream is an instance of XjsStream,
// supporting context sensitive and raw writes,
// `out.write(object)` and `out.raw(string)`
// respectively.
// 
// ##### __out
//
// Internal use copy of out&mdash;do not overwrite (unless you really want to)
//
// #### global
//
// Named reference to the global context for variable exists checks
//
// #### process
//
// Reference to the global node.js process
//
// #### console
//
// Convenience object for writing to stdout
//
// #### Buffer
//
// The node.js Buffer object
//
// #### require
//
// For importing external modules
//
// #### __filename
//
// `filename` passed to the compile function
//
// #### __dirname
//
// Directory of `filename`
//
// #### setTimeout
//
// Creates a new callback timer
//
// #### clearTimeout
//
// Stops a callback timer created by `setTimeout`
//
// #### setInterval
//
// Creates a new periodic callback clock
//
// #### clearInterval
//
// Stops a periodic callback clock created by `setInterval`
//
function compile(js, filename) {
  var template = {
    id: filename,
    filename: filename
  };
  
  function require(path) {
    return module._load(path, template);
  }
  
  require.resolve = function (request) {
    return module._resolveFilename(request, template)[1];
  };
  
  require.cache = module._cache;
  
  dirname = path.dirname(filename);
  
  var script = vm.createScript(js, filename);
  
  return function (out, locals) {
    var end = false;
    if (Object.getPrototypeOf(out) !== XjsStream.prototype) {
      var stream = new XjsStream();
      stream.pipe(out);
      out = stream;
      end = true;
    }
    
    locals = locals || {};
    var context = {};
    
    for (var k in locals) {
      context[k] = locals[k];
    }
    
    context.out = out;
    context.__out = out;
    context.global = context;
    context.process    = process;
    context.console    = console;
    context.Buffer     = Buffer;
    context.require    = require;
    context.__filename = filename;
    context.__dirname  = dirname;
    // NOTE: no module or exports in xjs context
    context.setTimeout    = setTimeout;
    context.clearTimeout  = clearTimeout;
    context.setInterval   = setInterval;
    context.clearInterval = clearInterval;
    
    script.runInNewContext(context);
    
    if (end) {
      out.end();
    }
  };
}
