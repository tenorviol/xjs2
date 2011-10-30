var parser = require('../lib/parser');

[

  // data
  // note: character references will be parsed in stage 2
  {
    source: 'foo & bar &amp; fubar',
    tokens: [
      { type: 'Data',
        source: 'foo & bar &amp; fubar' }
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
    source: '<img id="double \'quoted\'" src="http://google.com/?search=foo&bar">',
    tokens: [
      { type: 'StartTag',
        name: 'img',
        attributes: [
          { name: 'id',
            value: '"double \'quoted\'"',
            source: ' id="double \'quoted\'"' },
          { name: 'src',
            value: '"http://google.com/?search=foo&bar"',
            source: ' src="http://google.com/?search=foo&bar"' }
        ],
        close: '',
        source: '<img id="double \'quoted\'" src="http://google.com/?search=foo&bar">' }
    ]
  },
  
  // Tag: self closing element with attributes
  {
    source: "<img id='single \"quoted\"' src='http://google.com/favicon.ico'/>",
    tokens: [
      { type: 'StartTag',
        name: 'img',
        attributes: [
          { name: 'id',
            value: '\'single "quoted"\'',
            source: ' id=\'single "quoted"\'' },
          { name: 'src',
            value: '\'http://google.com/favicon.ico\'',
            source: ' src=\'http://google.com/favicon.ico\'' }
        ],
        close: '/',
        source: '<img id=\'single "quoted"\' src=\'http://google.com/favicon.ico\'/>' }
    ]
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
    source: '<中国:Nonsense 义勇军进行曲="Chinese characters I copied from wikipedia">',
    tokens: [
      { type: 'StartTag',
        name: '中国:Nonsense',
        attributes: [
          { name: '义勇军进行曲',
            value: '"Chinese characters I copied from wikipedia"',
            source: ' 义勇军进行曲="Chinese characters I copied from wikipedia"' }
        ],
        close: '',
        source: '<中国:Nonsense 义勇军进行曲="Chinese characters I copied from wikipedia">' }
    ]
  },
  
  // open tag, data, close tag
  {
    source: '<div id="foo">bar</div>',
    tokens: [
      { type: 'StartTag',
        name: 'div',
        attributes: [ { name: 'id', value: '"foo"', source: ' id="foo"' } ],
        close: '',
        source: '<div id="foo">' },
      { type: 'Data', source: 'bar' },
      { type: 'EndTag',
        name: 'div',
        end: true,
        source: '</div>' }
    ]
  },
  
  // html5 doctype, with empty html document
  {
    source: '<!DOCTYPE html>\n<html>\n  <head></head>\n  <body></body>\n</html>',
    tokens: [
      { type: 'DOCTYPE', source: '<!DOCTYPE html>' },
      { type: 'Data', source: '\n' },
      { type: 'StartTag',
        name: 'html',
        attributes: [],
        close: '',
        source: '<html>' },
      { type: 'Data', source: '\n  ' },
      { type: 'StartTag',
        name: 'head',
        attributes: [],
        close: '',
        source: '<head>' },
      { type: 'EndTag',
        name: 'head',
        end: true,
        source: '</head>' },
      { type: 'Data', source: '\n  ' },
      { type: 'StartTag',
        name: 'body',
        attributes: [],
        close: '',
        source: '<body>' },
      { type: 'EndTag',
        name: 'body',
        end: true,
        source: '</body>' },
      { type: 'Data', source: '\n' },
      { type: 'EndTag',
        name: 'html',
        end: true,
        source: '</html>' }
    ]
  },
  
  // script tags can contain '<'
  {
    source: '<script>foo<bar;</script>',
    tokens: [
      { type: 'ScriptTag',
        attributes: [],
        script: 'foo<bar;',
        source: '<script>foo<bar;</script>' }
    ]
  },
  
  // so can style (it's invalid css)
  {
    source: '<style>jeremiah <candy </style>',
    tokens: [
      { type: 'StyleTag',
        attributes: [],
        style: 'jeremiah <candy ',
        source: '<style>jeremiah <candy </style>' }
    ]
  },
  
  {
    source: '<![CDATA[Now <blink>THIS</blink> is real CDATA...]]>',
    tokens: [
      { type: 'CDATA',
        source: '<![CDATA[Now <blink>THIS</blink> is real CDATA...]]>' }
    ]
  },
  
  {
    source: '<!-- comment -->',
    tokens: [ { type: 'Comment', source: '<!-- comment -->' } ]
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
    source: '<!----> LEGAL COMMENT!!!',
    tokens: [
      { type: 'Comment', source: '<!---->' },
      { type: 'Data', source: ' LEGAL COMMENT!!!' }
    ]
  },
  
  {
    source: '<!-- no old school mdashes--allowed in comments either -->',
    error: true
  },
  
  // js processing instruction
  {
    source: '<?js var foo="bar" ?>',
    tokens: [ { source: '<?js var foo="bar" ?>' } ]
  },
  
  // js processing instruction
  {
    source: '<?= bar ?>',
    tokens: [ { source: '<?= bar ?>' } ]
  }

].forEach(function (test) {
  
  exports[test.source] = function (assert) {
    var toThrowOrNot = test.error ? "throws" : "doesNotThrow";
    assert[toThrowOrNot](function () {
      try {
        var result = parser.parse(test.source);
        //console.log(result);
        assert.equal(test.source, joinSources(result));
        test.tokens && assert.deepEqual(test.tokens, result);
      } catch (e) {
        test.error || console.log(e.toString());  // debug helper
        throw e;  // re-throw
      }
    });
    assert.done();
  };
  
});

function joinSources(objects) {
  var source = '';
  objects.forEach(function (object) {
    source += object.source;
  });
  return source;
}
