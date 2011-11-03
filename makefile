lib/parser.js: src/xjs.pegjs
	pegjs src/xjs.pegjs lib/parser.js

clean:
	rm lib/parser.js

test: nodeunit

nodeunit:
	nodeunit test/parser.test.js
	nodeunit test/interpreter.test.js
