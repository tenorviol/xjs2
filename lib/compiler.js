var vm = require('vm');
var module = require('module');
var path = require('path');

exports.compile = compile;

function compile(js, options) {
  options = options || {};
  var filename = options.filename || 'undefined';
  
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
  
  var template = function (out, context) {
    context = context || {};
    context.out = out;
    context.__out = out;
    
    context.global = context;
    context.process = process;
    context.console = console;
    context.Buffer = Buffer;
    context.require = require;
    context.__filename = filename;
    context.__dirname = dirname;
    // NOTE: no module or exports in xjs context
    context.setTimeout = setTimeout;
    context.clearTimeout = clearTimeout;
    context.setInterval = setInterval;
    context.clearInterval = clearInterval;
    
    script.runInNewContext(context);
  };
  
  return template;
}
