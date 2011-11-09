var vm = require('vm');
var module = require('module');
var path = require('path');

exports.compile = compile;

function compile(js, filename) {
  
  function require(path) {
    return module._load(path);
  }
  
  // TODO
  //require.resolve = function(request) {
  //  return module._resolveFilename(request, module)[1];
  //};
  
  require.cache = module._cache;
  
  dirname = path.dirname(filename);
  
  var script = vm.createScript(js, filename);
  
  return function (out, locals) {
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
  };
}
