var parser = require('../lib/parser');

[

  // data
  // note: character references will be parsed in stage 2
  {
    source: 'foo & bar &amp; fubar',
    tokens: [
      {
        type: 'Data',
        source: 'foo & bar &amp; fubar'
      }
    ]
  },
  
  // null characters are illegal in data elements
  {
    source: 'illegal null\0char',
    error: true
  },
  
  // tag: void element with attributes
  // note: the ambiguous ampersand here is illegal and should be caught in stage 2
  {
    source: '<img id="double \'quoted\'" src="http://google.com/?search=foo&bar">'
  },
  
  // Tag: self closing element with attributes
  {
    source: "<img id='single \"quoted\"' src='http://google.com/favicon.ico'/>"
  },
  
  // null characters are illegal in tag attributes
  {
    source: '<div id="illegal null\0char">',
    error: true
  },
  
  // null characters are illegal in tag attributes
  {
    source: "<div id='illegal null\0char'>",
    error: true
  },
  
  // foreign elements may contain unicode characters
  {
    source: '<中国:Nonsense 义勇军进行曲="Chinese characters I copied from wikipedia">'
  },
  
  // open tag, data, close tag
  {
    source: '<div id="foo">bar</div>'
  },
  
  // html5 doctype, with empty html document
  {
    source: '<!DOCTYPE html>\n<html>\n  <head></head>\n  <body></body>\n</html>'
  },
  
  // script tags can contain '<'
  {
    source: '<script>foo<bar;</script>'
  },
  
  // so can style (it's invalid css)
  {
    source: '<style>jeremiah <candy </style>'
  },
  
  {
    source: '<![CDATA[Now <blink>THIS</blink> is real CDATA...]]>'
  },
  
  {
    source: '<!-- comment -->'
  },
  
  {
    source: '<!--> illegal comment',
    error: true
  },
  
  {
    source: '<!---> illegal comment',
    error: true
  },
  
  {
    source: '<!----> LEGAL COMMENT!!!'
  },
  
  {
    source: '<!-- no old school mdashes--allowed in comments either -->',
    error: true
  },
  
  // js processing instruction
  {
    source: '<?js var foo="bar" ?>'
  },
  
  // js processing instruction
  {
    source: '<?= bar ?>'
  }

].forEach(function (test) {
  
  exports[test.source] = function (assert) {
    var toThrowOrNot = test.error ? "throws" : "doesNotThrow";
    assert[toThrowOrNot](function () {
      try {
        var result = parser.parse(test.source);
        console.log(result);
        assert.equal(test.source, result.join(""));
        if (test.tokens) {
          assert.equal(test.tokens.length, result.length);
          for (var i = 0; i < test.tokens.length; i++) {
            tokenEqual.call(assert, test.tokens[i], result[i]);
          }
        }
      } catch (e) {
        test.error || console.log(e.toString());  // debug helper
        throw e;  // re-throw
      }
    });
    assert.done();
  };
  
});

function tokenEqual(token1, token2) {
  for (key in token1) {
    if (key === 'toString') {
      continue;
    }
    this.equal(token1[key], token2[key]);
  }
}
