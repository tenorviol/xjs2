module.exports = [

  // data
  // note: character references will be parsed in stage 2
  {
    source: 'foo & bar &amp; fubar',
    tokens: [
      { type: 'Data',
        source: 'foo & bar &amp; fubar' }
    ],
    code: [
      'out.raw("foo & bar &amp; fubar");'
    ]
  },
  
  // null characters are illegal in data elements
  {
    source: 'illegal null\0char',
    tokens: null
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
        closed: false,
        source: '<img id="double \'quoted\'" src="http://google.com/?search=foo&bar">' }
    ],
    code: null
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
        closed: true,
        source: '<img id=\'single "quoted"\' src=\'http://google.com/favicon.ico\'/>' }
    ],
    code: [
      'out.raw("<img id=\'single \\"quoted\\"\' src=\'http://google.com/favicon.ico\'/>");'
    ]
  },
  
  // null characters are illegal in tag attributes
  {
    source: '<div id="illegal null\0char">',
    tokens: null
  },
  
  // null characters are illegal in tag attributes
  {
    source: "<div id='illegal null\0char'>",
    tokens: null
  },
  
  // foreign elements may contain unicode characters
  {
    source: '<中国:Nonsense 义勇军进行曲="Chinese characters I copied from wikipedia" />',
    tokens: [
      { type: 'StartTag',
        name: '中国:Nonsense',
        attributes: [
          { name: '义勇军进行曲',
            value: '"Chinese characters I copied from wikipedia"',
            source: ' 义勇军进行曲="Chinese characters I copied from wikipedia"' }
        ],
        closed: true,
        source: '<中国:Nonsense 义勇军进行曲="Chinese characters I copied from wikipedia" />' }
    ]
  },
  
  // open tag, data, close tag
  {
    source: '<div id="foo">bar</div>',
    tokens: [
      { type: 'StartTag',
        name: 'div',
        attributes: [ { name: 'id', value: '"foo"', source: ' id="foo"' } ],
        closed: false,
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
        closed: false,
        source: '<html>' },
      { type: 'Data', source: '\n  ' },
      { type: 'StartTag',
        name: 'head',
        attributes: [],
        closed: false,
        source: '<head>' },
      { type: 'EndTag',
        name: 'head',
        end: true,
        source: '</head>' },
      { type: 'Data', source: '\n  ' },
      { type: 'StartTag',
        name: 'body',
        attributes: [],
        closed: false,
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
        inner: [ { type: 'Data', source: 'foo<bar;' } ],
        source: '<script>foo<bar;</script>' }
    ]
  },
  
  // so can style (it's invalid css)
  {
    source: '<style>jeremiah <candy </style>',
    tokens: [
      { type: 'StyleTag',
        attributes: [],
        inner: [ { type: 'Data', source: 'jeremiah <candy ' } ],
        source: '<style>jeremiah <candy </style>' }
    ]
  },
  
  {
    source: '<![CDATA[Now <blink>THIS</blink> is real CDATA...]]>',
    tokens: [
      { type: 'CDATA',
        inner: [
          { type: 'Data',
            source: 'Now <blink>THIS</blink> is real CDATA...' }
        ],
        source: '<![CDATA[Now <blink>THIS</blink> is real CDATA...]]>' }
    ]
  },
  
  {
    source: '<!-- comment -->',
    tokens: [ { type: 'Comment', source: '<!-- comment -->' } ]
  },
  
  {
    source: '<!--> illegal comment',
    tokens: null
  },
  
  {
    source: '<!---> illegal comment',
    tokens: null
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
    tokens: null
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
  },
  
  // script embeded processing instruction
  {
    source: '<script>foo; <?=bar?>; fubar</script>',
    tokens: [
      { type: 'ScriptTag',
        attributes: [],
        inner: [
          { type: 'Data',
            source: 'foo; ' },
          { source: '<?=bar?>' },
          { type: 'Data',
            source: '; fubar' }          
        ],
        source: '<script>foo; <?=bar?>; fubar</script>' }
    ]
  },
  
  // style embeded processing instruction
  {
    source: '<style>foo; <?=bar?>; fubar</style>',
    tokens: [
      { type: 'StyleTag',
        attributes: [],
        inner: [
          { type: 'Data',
            source: 'foo; ' },
          { source: '<?=bar?>' },
          { type: 'Data',
            source: '; fubar' }          
        ],
        source: '<style>foo; <?=bar?>; fubar</style>' }
    ]
  },
  
  // cdata embeded processing instruction
  {
    source: '<![CDATA[foo; <?=bar?>; fubar]]>',
    tokens: [
      { type: 'CDATA',
        inner: [
          { type: 'Data',
            source: 'foo; ' },
          { source: '<?=bar?>' },
          { type: 'Data',
            source: '; fubar' }          
        ],
        source: '<![CDATA[foo; <?=bar?>; fubar]]>' }
    ]
  }

];
