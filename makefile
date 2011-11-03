lib/parser.js: src/xjs.pegjs
	pegjs src/xjs.pegjs lib/parser.js

test: nodeunit

nodeunit:
	nodeunit test/*.test.js

clean:
	rm lib/parser.js
