{
  var tokens = require('./tokens');

  function joinSources(objects) {
    var source = '';
    objects.forEach(function (object) {
      source += object.source;
    });
    return source;
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
    / CDATA
    / Comment
    )*

DoctypeHtml5
  = '<!DOCTYPE html>' {
    return {
      type: tokens.DOCTYPE,
      source: "<!DOCTYPE html>"
    };
  }

ScriptTag
  = '<script' attributes:Attributes '>' script:ScriptInnards '</script>' {
    return {
      type: tokens.ScriptTag,
      name: "script",
      attributes: attributes,
      inner: script,
      source: "<script" + joinSources(attributes) + ">" + joinSources(script) + "</script>"
    };
  }

ScriptInnards
  = ( ScriptData
    / ProcessingInstruction
    )*

StyleTag
  = '<style' attributes:Attributes '>' style:StyleInnards '</style>' {
    return {
      type: tokens.StyleTag,
      name: "style",
      attributes: attributes,
      inner: style,
      source: "<style" + joinSources(attributes) + ">" + joinSources(style) + "</style>"
    };
  }

StyleInnards
  = ( StyleData
    / ProcessingInstruction
    )*

StartTag
  = '<' name:Name attributes:Attributes w:Ws closed:'/'? '>' {
    return {
      type: tokens.StartTag,
      name: name,
      attributes: attributes,
      closed: closed === '/',
      source: "<" + name + joinSources(attributes) + w + closed + ">"
    };
  }

EndTag
  = '</' name:Name '>' {
    return {
      type: tokens.EndTag,
      name: name,
      end: true,
      source: "</" + name + ">"
    };
  }

CDATA
  = '<![CDATA[' data:CDATAInnards ']]>' {
    return {
      type: tokens.CDATA,
      inner: data,
      source: '<![CDATA[' + joinSources(data) + ']]>'
    }
  }

CDATAInnards
  = ( CDATAData
    / ProcessingInstruction
    )*

Comment
  = '<!--' !('>' / '->') text:CommentText* '-->' {
    return {
      type: tokens.Comment,
      source: '<!--' + text.join("") + '-->'
    };
  }

ProcessingInstruction
  = JsProcessingInstruction
  / OutputProcessingInstruction

JsProcessingInstruction
  = '<?js' text:ProcessingInstructionText* '?>'  {
    // TODO: lots of stuff, e.g. '?>' could be in a comment or string
    return {
      type: tokens.PIjs,
      script: text.join(""),
      source: '<?js' + text.join("") + '?>'
    };
  }

OutputProcessingInstruction
  = '<?=' text:ProcessingInstructionText* '?>' {
    return {
      type: tokens.PIout,
      script: text.join(""),
      source: '<?=' + text.join("") + '?>'
    };
  }



Attributes
  = Attribute*

Attribute
  = ValueAttribute
  / EmptyAttribute

ValueAttribute
  = w1:Ws name:Name w2:Ws '=' w3:Ws value:AttributeValue {
    return {
      name: name,
      value: value,
      source: w1 + name + w2 + "=" + w3 + value
    };
  }

EmptyAttribute
  = w:Ws name:Name {
    return {
      type: tokens.Attribute,
      name: name,
      source: w + name
    };
  }

AttributeValue
  = AttributeValueDoubleQuoted
  / AttributeValueSingleQuoted

AttributeValueDoubleQuoted
  = '"' value:DoubleQuotedText* '"' { return '"' + value.join("") + '"'; }

AttributeValueSingleQuoted
  = '\'' value:SingleQuotedText* "'" { return "'" + value.join("") + "'"; }



Data
  = data:DataText+ {
    return {
      type: tokens.Data,
      source: data.join("")
    };
  }

ScriptData
  = data:ScriptText+ {
    return {
      type: tokens.Data,
      source: data.join("")
    };
  }

StyleData
  = data:StyleText+ {
    return {
      type: tokens.Data,
      source: data.join("")
    };
  }

CDATAData
  = data:CDATAText+ {
    return {
      type: tokens.Data,
      source: data.join("")
    }
  }

Ws
  = space:[\t\n\r ]*  { return space.join(""); }



DataText
  = !'<' c:Text { return c; }

ScriptText
  = DataText
  / '<' !('?' / '/script') { return '<'; }

StyleText
  = DataText
  / '<' !('?' / '/style') { return '<'; }

DoubleQuotedText
  = !'"' c:Text { return c; }

SingleQuotedText
  = !"'" c:Text { return c; }

CDATAText
  = !('<?' / ']]>') c:Text { return c; }

CommentText
  = !'--' c:Text { return c; }

ProcessingInstructionText
  = !'?>' c:Text { return c; }



// Ref: Extensible Markup Language (XML) 1.1 (Second Edition)

// http://www.w3.org/TR/2006/REC-xml11-20060816/#charsets
Text
  = [\x09\x0A\x0D\x20-\x7E\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]

// http://www.w3.org/TR/2006/REC-xml11-20060816/#sec-common-syn
Name
  = first:NameStartChar rest:NameChar* { return first + rest.join(""); }

NameStartChar
  = [:A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]

NameChar
  = NameStartChar / [-.0-9\u00B7\u0300-\u036F\u203F-\u2040]
