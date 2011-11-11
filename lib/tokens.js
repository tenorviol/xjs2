var tokens = [
  'DOCTYPE',
  'StartTag',
  'EndTag',
  'ScriptTag',
  'StyleTag',
  'CDATA',
  'Comment',
  'PIjs',
  'PIout',
  'Attribute',
  'Data'
];

for (var i = 0; i < tokens.length; i++) {
  var token = tokens[i];
  exports[token] = i + 1;
}
