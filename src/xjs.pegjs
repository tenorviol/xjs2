{
  function sourceToString() {
    return this.source;
  }
}

start
  = (Data / Tag)*

Data
  = data:([^&<] / CharacterReference)+ {
    // TODO: null characters should throw
    return {
      type: 'Data',
      source: data.join(""),
      toString: sourceToString
    };
  }

CharacterReference
  = '&amp;'
  / '&lt;'
  / '&gt;'
  / '&quot;'
  / '&' { throw new Error('Invalid character reference'); }

Tag
  = ScriptTag
  / StyleTag
  / StartTag
  / EndTag
  / DoctypeHtml5

DoctypeHtml5
  = '<!DOCTYPE html>' {
    return {
      type: "DOCTYPE",
      source: "<!DOCTYPE html>",
      toString: sourceToString
    };
  }

StartTag
  = '<' name:TagName attributes:Attributes close:'/'? '>' {
    return {
      type: 'StartTag',
      name: name,
      attributes: attributes,
      close: close,
      source: "<" + name + attributes + close + ">",
      toString: sourceToString
    };
  }

EndTag
  = '</' name:TagName '>' {
    return {
      type: 'EndTag',
      name: name,
      end: true,
      source: "</" + name + ">",
      toString: sourceToString
    };
  }

ScriptTag
  = '<script' attributes:Attributes '>' script:([^<] / '<' !'/script>' { return '<'; })* '</script>' {
    return {
      type: "ScriptTag",
      attributes: attributes,
      script: script.join(""),
      source: "<script" + attributes.join("") + ">" + script.join("") + "</script>",
      toString: sourceToString
    };
  }

StyleTag
  = '<style' attributes:Attributes '>' style:([^<] / '<' !'/style>' { return '<'; })* '</style>' {
    return {
      type: "StyleTag",
      attributes: attributes,
      style: style.join(""),
      source: "<style" + attributes.join("") + ">" + style.join("") + "</style>",
      toString: sourceToString
    };
  }

TagName
  = name:[a-z]+ { return name.join(""); }  // TODO: full xml support e.g. 'fb:profile-pic'

Attributes
  = Attribute*

Attribute
  = ValueAttribute
  / EmptyAttribute

EmptyAttribute
  = w:Space name:AttributeName {
    return {
      type: "Attribute",
      name: name,
      source: w + name,
      toString: sourceToString
    };
  }

ValueAttribute
  = w1:Space name:AttributeName w2:Space '=' w3:Space value:AttributeValue {
    return {
      type: "Attribute",
      name: name,
      value: value,
      source: w1 + name + w2 + "=" + w3 + value,
      toString: sourceToString
    };
  }

AttributeName
  = TagName

AttributeValue
  = '"' value:[^"]* '"' { return '"' + value.join("") + '"'; }

Space
  = space:(' ' / '\t' / '\n' / '\r')*  { return space.join(""); }

//MarkupDeclaration

ProcessingInstruction
  = '<?' (!'?' / '?' !'>') '?>'  // TODO: lots of stuff, e.g. '?>' could be in a comment or string
