// testing xjs.render(filename)
// ============================
//
// ### method
//
// 1. Create a server responding with an xjs.render template
// 2. Hit the server
// 3. Assert the response contains data rendered in xjs

var http = require('http');
var xjs = require('../index');

var server;
var port = 3000;

exports['start server'] = function (assert) {
  server = http.createServer(xjs.render('example/foo.xjs'));
  server.listen(port, function () {
    assert.done();
  });
};

exports['hit it'] = function (assert) {
  http.get({ host: 'localhost', port: port }, function (response) {
    var body = '';
    response.on('data', function (data) {
      body += data;
    });
    response.on('end', function () {
      assert.ok(body.indexOf('localhost:' + port));
      assert.done();
    });
  });
};

exports['stop server'] = function (assert) {
  server.close();
  assert.done();
};
