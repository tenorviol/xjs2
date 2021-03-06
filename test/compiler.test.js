var compiler = require('../lib/compiler');
var XjsStream = require('../lib/XjsStream');
var StringStream = require('../lib/StringStream');

[
  {
    code: '__out.write("foo");',
    expect: 'foo'
  },
  {
    code: 'out.write(new Error("this sucks").toString())',
    expect: 'Error: this sucks'
  },
  {
    code: 'global.foo="bar";out.write(foo);',
    expect: 'bar'
  },
  {
    code: 'out.write(process.argv)',
    expect: process.argv.toString()
  },
  {
    code: 'out.write(new Buffer("fubar"));',
    expect: 'fubar'
  },
  {
    code: 'var crypto = require("crypto");',
    expect: ''
  },
  {
    code: 'out.write(require.resolve("./interpreter.test"));',
    expect: __dirname + '/interpreter.test.js'
  },
  {
    code: 'out.write(typeof require.cache);',
    expect: 'object'
  },
  {
    code: 'out.write(__filename)',
    expect: __dirname + '/mytest'
  },
  {
    code: 'out.write(__dirname)',
    expect: __dirname
  },
  {
    code: [
      'out = out.async();',
      'setTimeout(function() {',
      '  out.write("foo");',
      '  out.end();',
      '}, 50);'
    ].join("\n"),
    expect: 'foo'
  }
].forEach(function (test) {
  
  exports[test.code] = function (assert) {
    var template = compiler.compile(test.code, __dirname + '/mytest');
    
    var result = new StringStream();
    result.on('end', function () {
      assert.equal(test.expect, result.toString());
      assert.done();
    });
    
    template(result);
  };
  
});
