lib/parser.js: src/xjs.pegjs
	pegjs src/xjs.pegjs lib/parser.js

namedCharacterEntities: lib/namedCharacterEntities.js

lib/namedCharacterEntities.js:
	# download all named entities from w3
	curl -O http://www.w3.org/TR/xml-entity-names/bycodes.html
	# trim to lines between <pre> and </pre>
	# eliminate leading .*<pre> text
	# eliminate trailing </pre>.* text
	# remove blank lines
	# remove tags
	sed -n '/<pre>/,/<\/pre>/p' bycodes.html |\
	sed 's/^.*<pre>//' |\
	sed 's/<\/pre>.*//' |\
	sed '/^$$/d' |\
	sed 's/<[^>]*>//g' > bycodes.csv
	# convert the working csv file to a node module
	awk ' \
	  BEGIN { \
	    FS=","; \
	    print "module.exports = {"; \
	  } \
	  { \
	    comment = ""; \
	    if (match($$1, /[0-9A-Fa-f]{5,}/)) { \
	      print "  // " $$0; \
	      next; \
	    } \
	    gsub(/ /, "", $$1); \
	    gsub(/U\+/, "\\u", $$1); \
	    gsub(/ *$$/, "", $$2); \
	    for (i = 3; i <= NF; i++) { \
	      gsub(/ /, "", $$i); \
	      print "  \"" $$i "\" : \"" $$1 "\",\t//" $$2; \
	    } \
	  } \
	  END { \
	    print "};"; \
	  }' bycodes.csv > lib/namedCharacterEntities.js
	# remove working files
	rm bycodes.*

clean:
	rm lib/parser.js

test: nodeunit

nodeunit:
	nodeunit test/*.test.js
