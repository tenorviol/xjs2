var tokens = require('../lib/tokens');

module.exports = [

  // data
  // note: character references will be parsed in stage 2
  {
    source: 'foo & bar &amp; fubar',
    tokens: [
      { type: tokens.Data,
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
      { type: tokens.StartTag,
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
      { type: tokens.StartTag,
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
      { type: tokens.StartTag,
        name: '中国:Nonsense',
        attributes: [
          { name: '义勇军进行曲',
            value: '"Chinese characters I copied from wikipedia"',
            source: ' 义勇军进行曲="Chinese characters I copied from wikipedia"' }
        ],
        closed: true,
        source: '<中国:Nonsense 义勇军进行曲="Chinese characters I copied from wikipedia" />' }
    ],
    code: [
      'out.raw("<中国:Nonsense 义勇军进行曲=\\"Chinese characters I copied from wikipedia\\" />");'
    ]
  },
  
  // open tag, data, close tag
  {
    source: '<div id="foo">bar</div>',
    tokens: [
      { type: tokens.StartTag,
        name: 'div',
        attributes: [ { name: 'id', value: '"foo"', source: ' id="foo"' } ],
        closed: false,
        source: '<div id="foo">' },
      { type: tokens.Data, source: 'bar' },
      { type: tokens.EndTag,
        name: 'div',
        end: true,
        source: '</div>' }
    ],
    code: [
      'out.raw("<div id=\\"foo\\">");',
      'out.raw("bar");',
      'out.raw("</div>");'
    ]
  },
  
  // html5 doctype, with empty html document
  {
    source: '<!DOCTYPE html>\n<html>\n  <head></head>\n  <body></body>\n</html>',
    tokens: [
      { type: tokens.DOCTYPE, source: '<!DOCTYPE html>' },
      { type: tokens.Data, source: '\n' },
      { type: tokens.StartTag,
        name: 'html',
        attributes: [],
        closed: false,
        source: '<html>' },
      { type: tokens.Data, source: '\n  ' },
      { type: tokens.StartTag,
        name: 'head',
        attributes: [],
        closed: false,
        source: '<head>' },
      { type: tokens.EndTag,
        name: 'head',
        end: true,
        source: '</head>' },
      { type: tokens.Data, source: '\n  ' },
      { type: tokens.StartTag,
        name: 'body',
        attributes: [],
        closed: false,
        source: '<body>' },
      { type: tokens.EndTag,
        name: 'body',
        end: true,
        source: '</body>' },
      { type: tokens.Data, source: '\n' },
      { type: tokens.EndTag,
        name: 'html',
        end: true,
        source: '</html>' }
    ],
    code: [
      'out.raw("<!DOCTYPE html>");',
      'out.raw("\\n");',
      'out.raw("<html>");',
      'out.raw("\\n  ");',
      'out.raw("<head>");',
      'out.raw("</head>");',
      'out.raw("\\n  ");',
      'out.raw("<body>");',
      'out.raw("</body>");',
      'out.raw("\\n");',
      'out.raw("</html>");'
    ]
  },
  
  // script tags can contain '<'
  {
    source: '<script>foo<bar;</script>',
    tokens: [
      { type: tokens.ScriptTag,
        name: 'script',
        attributes: [],
        inner: [ { type: tokens.Data, source: 'foo<bar;' } ],
        source: '<script>foo<bar;</script>' }
    ],
    code: [
      'out.raw("<script>");',
      'out.state = "script";',
      'out.raw("foo<bar;");',
      'out.raw("</script>");',
      'out.state = "Data";'
    ]
  },
  
  // so can style (it's invalid css)
  {
    source: '<style>jeremiah <candy </style>',
    tokens: [
      { type: tokens.StyleTag,
        name: 'style',
        attributes: [],
        inner: [ { type: tokens.Data, source: 'jeremiah <candy ' } ],
        source: '<style>jeremiah <candy </style>' }
    ],
    code: [
      'out.raw("<style>");',
      'out.state = "style";',
      'out.raw("jeremiah <candy ");',
      'out.raw("</style>");',
      'out.state = "Data";'
    ]
  },
  
  {
    source: '<![CDATA[Now <blink>THIS</blink> is real CDATA...]]>',
    tokens: [
      { type: tokens.CDATA,
        inner: [
          { type: tokens.Data,
            source: 'Now <blink>THIS</blink> is real CDATA...' }
        ],
        source: '<![CDATA[Now <blink>THIS</blink> is real CDATA...]]>' }
    ],
    code: [
      'out.raw("<![CDATA[");',
      'out.state = "CDATA";',
      'out.raw("Now <blink>THIS</blink> is real CDATA...");',
      'out.raw("]]>");',
      'out.state = "Data";'
    ]
  },
  
  {
    source: '<!-- comment -->',
    tokens: [ { type: tokens.Comment, source: '<!-- comment -->' } ],
    code: [
      'out.raw("<!-- comment -->");'
    ]
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
      { type: tokens.Comment, source: '<!---->' },
      { type: tokens.Data, source: ' LEGAL COMMENT!!!' }
    ],
    code: [
      'out.raw("<!---->");',
      'out.raw(" LEGAL COMMENT!!!");'
    ]
  },
  
  {
    source: '<!-- no old school mdashes--allowed in comments either -->',
    tokens: null
  },
  
  // js processing instruction
  {
    source: '<?js var foo="bar" ?>',
    tokens: [
      { type: tokens.PIjs,
        script: ' var foo="bar" ',
        source: '<?js var foo="bar" ?>' }
    ],
    code: [
      ' var foo="bar" '
    ]
  },
  
  // js processing instruction
  {
    source: '<?= bar ?>',
    tokens: [
      { type: tokens.PIout,
        script: ' bar ',
        source: '<?= bar ?>' }
    ],
    code: [
      'out.write( bar );'
    ]
  },
  
  // script embeded processing instruction
  {
    source: '<script>foo; <?=bar?>; fubar</script>',
    tokens: [
      { type: tokens.ScriptTag,
        name: 'script',
        attributes: [],
        inner: [
          { type: tokens.Data,
            source: 'foo; ' },
          { type: tokens.PIout,
            script: 'bar',
            source: '<?=bar?>' },
          { type: tokens.Data,
            source: '; fubar' }          
        ],
        source: '<script>foo; <?=bar?>; fubar</script>' }
    ],
    code: [
      'out.raw("<script>");',
      'out.state = "script";',
      'out.raw("foo; ");',
      'out.write(bar);',
      'out.raw("; fubar");',
      'out.raw("</script>");',
      'out.state = "Data";'
    ]
  },
  
  // style embeded processing instruction
  {
    source: '<style>foo; <?=bar?>; fubar</style>',
    tokens: [
      { type: tokens.StyleTag,
        name: 'style',
        attributes: [],
        inner: [
          { type: tokens.Data,
            source: 'foo; ' },
          { type: tokens.PIout,
            script: 'bar',
            source: '<?=bar?>' },
          { type: tokens.Data,
            source: '; fubar' }          
        ],
        source: '<style>foo; <?=bar?>; fubar</style>' }
    ],
    code: [
      'out.raw("<style>");',
      'out.state = "style";',
      'out.raw("foo; ");',
      'out.write(bar);',
      'out.raw("; fubar");',
      'out.raw("</style>");',
      'out.state = "Data";'
    ]
  },
  
  // cdata embeded processing instruction
  {
    source: '<![CDATA[foo; <?=bar?>; fubar]]>',
    tokens: [
      { type: tokens.CDATA,
        inner: [
          { type: tokens.Data,
            source: 'foo; ' },
          { type: tokens.PIout,
            script: 'bar',
            source: '<?=bar?>' },
          { type: tokens.Data,
            source: '; fubar' }          
        ],
        source: '<![CDATA[foo; <?=bar?>; fubar]]>' }
    ],
    code: [
      'out.raw("<![CDATA[");',
      'out.state = "CDATA";',
      'out.raw("foo; ");',
      'out.write(bar);',
      'out.raw("; fubar");',
      'out.raw("]]>");',
      'out.state = "Data";'
    ]
  }

];
