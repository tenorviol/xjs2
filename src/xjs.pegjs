{
  function sourceToString() {
    return this.source;
  }
}

start
  = ( Data
    / DoctypeHtml5
    / ProcessingInstruction
    / ScriptTag
    / StyleTag
    / StartTag
    / EndTag
    )*

Data
  = data:[^<\0]+ {
    // TODO: null characters should throw
    return {
      type: 'Data',
      source: data.join(""),
      toString: sourceToString
    };
  }

DoctypeHtml5
  = '<!DOCTYPE html>' {
    return {
      type: "DOCTYPE",
      source: "<!DOCTYPE html>",
      toString: sourceToString
    };
  }

StartTag
  = '<' name:Name attributes:Attributes close:'/'? '>' {
    return {
      type: 'StartTag',
      name: name,
      attributes: attributes,
      close: close,
      source: "<" + name + attributes.join("") + close + ">",
      toString: sourceToString
    };
  }

EndTag
  = '</' name:Name '>' {
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

Attributes
  = Attribute*

Attribute
  = ValueAttribute
  / EmptyAttribute

EmptyAttribute
  = w:Space name:Name {
    return {
      type: "Attribute",
      name: name,
      source: w + name,
      toString: sourceToString
    };
  }

ValueAttribute
  = w1:Space name:Name w2:Space '=' w3:Space value:AttributeValue {
    return {
      type: "Attribute",
      name: name,
      value: value,
      source: w1 + name + w2 + "=" + w3 + value,
      toString: sourceToString
    };
  }

AttributeValue
  = '"' value:[^"]* '"' { return '"' + value.join("") + '"'; }

Space
  = space:(' ' / '\t' / '\n' / '\r')*  { return space.join(""); }

//MarkupDeclaration

ProcessingInstruction
  = '<?' ([^?] / '?' !'>') '?>'  // TODO: lots of stuff, e.g. '?>' could be in a comment or string


// Ref: Extensible Markup Language (XML) 1.1 (Second Edition)
// http://www.w3.org/TR/2006/REC-xml11-20060816/#sec-common-syn

Name
  = first:NameStartChar rest:NameChar* { return first + rest.join(""); }

NameStartChar
  = [:A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]  // TODO: | [\u10000-\uEFFFF]

NameChar
  = NameStartChar / [-.0-9\u00B7\u0300-\u036F\u203F-\u2040]
