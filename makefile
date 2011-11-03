lib/lexer.js: src/xjs.pegjs
	pegjs src/xjs.pegjs lib/lexer.js

test: nodeunit

nodeunit:
	nodeunit test/*.test.js

clean:
	rm lib/lexer.js
