/*jshint browser:true */
/*!
* FitVids 1.1
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
*/

;(function( $ ){

  'use strict';

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null,
      ignore: null
    };

    if(!document.getElementById('fit-vids-style')) {
      // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
      var head = document.head || document.getElementsByTagName('head')[0];
      var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
      var div = document.createElement("div");
      div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
      head.appendChild(div.childNodes[1]);
    }

    if ( options ) {
      $.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        'iframe[src*="player.vimeo.com"]',
        'iframe[src*="youtube.com"]',
        'iframe[src*="youtube-nocookie.com"]',
        'iframe[src*="kickstarter.com"][src*="video.html"]',
        'object',
        'embed'
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var ignoreList = '.fitvidsignore';

      if(settings.ignore) {
        ignoreList = ignoreList + ', ' + settings.ignore;
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not('object object'); // SwfObj conflict patch
      $allVideos = $allVideos.not(ignoreList); // Disable FitVids on this video.

      $allVideos.each(function(){
        var $this = $(this);
        if($this.parents(ignoreList).length > 0) {
          return; // Disable FitVids on this video.
        }
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
        if ((!$this.css('height') && !$this.css('width')) && (isNaN($this.attr('height')) || isNaN($this.attr('width'))))
        {
          $this.attr('height', 9);
          $this.attr('width', 16);
        }
        var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if(!$this.attr('name')){
          var videoName = 'fitvid' + $.fn.fitVids._count;
          $this.attr('name', videoName);
          $.fn.fitVids._count++;
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+'%');
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
  
  // Internal counter for unique video names.
  $.fn.fitVids._count = 0;
  
// Works with either jQuery or Zepto
})( window.jQuery || window.Zepto );

/* http://prismjs.com/download.html?themes=prism&languages=markup+css+clike+javascript+asciidoc+bash+batch+git+handlebars+java+json+kotlin+markdown+powershell+properties+scala+yaml&plugins=line-highlight+line-numbers+file-highlight+toolbar+jsonp-highlight+highlight-keywords+previewer-base+normalize-whitespace+keep-markup+data-uri-highlight+show-language+copy-to-clipboard */
var _self = (typeof window !== 'undefined')
  ? window   // if in browser
  : (
    (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
      ? self // if in worker
      : {}   // if in node js
  );

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function () {

// Private helper vars
  var lang = /\blang(?:uage)?-(\w+)\b/i;
  var uniqueId = 0;

  var _ = _self.Prism = {
    manual: _self.Prism && _self.Prism.manual,
    util: {
      encode: function (tokens) {
        if (tokens instanceof Token) {
          return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
        } else if (_.util.type(tokens) === 'Array') {
          return tokens.map(_.util.encode);
        } else {
          return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
        }
      },

      type: function (o) {
        return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
      },

      objId: function (obj) {
        if (!obj['__id']) {
          Object.defineProperty(obj, '__id', {value: ++uniqueId});
        }
        return obj['__id'];
      },

      // Deep clone a language definition (e.g. to extend it)
      clone: function (o) {
        var type = _.util.type(o);

        switch (type) {
          case 'Object':
            var clone = {};

            for (var key in o) {
              if (o.hasOwnProperty(key)) {
                clone[key] = _.util.clone(o[key]);
              }
            }

            return clone;

          case 'Array':
            return o.map(function (v) {
              return _.util.clone(v);
            });
        }

        return o;
      }
    },

    languages: {
      extend: function (id, redef) {
        var lang = _.util.clone(_.languages[id]);

        for (var key in redef) {
          lang[key] = redef[key];
        }

        return lang;
      },

      /**
       * Insert a token before another token in a language literal
       * As this needs to recreate the object (we cannot actually insert before keys in object literals),
       * we cannot just provide an object, we need anobject and a key.
       * @param inside The key (or language id) of the parent
       * @param before The key to insert before. If not provided, the function appends instead.
       * @param insert Object with the key/value pairs to insert
       * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
       */
      insertBefore: function (inside, before, insert, root) {
        root = root || _.languages;
        var grammar = root[inside];

        if (arguments.length == 2) {
          insert = arguments[1];

          for (var newToken in insert) {
            if (insert.hasOwnProperty(newToken)) {
              grammar[newToken] = insert[newToken];
            }
          }

          return grammar;
        }

        var ret = {};

        for (var token in grammar) {

          if (grammar.hasOwnProperty(token)) {

            if (token == before) {

              for (var newToken in insert) {

                if (insert.hasOwnProperty(newToken)) {
                  ret[newToken] = insert[newToken];
                }
              }
            }

            ret[token] = grammar[token];
          }
        }

        // Update references in other language definitions
        _.languages.DFS(_.languages, function (key, value) {
          if (value === root[inside] && key != inside) {
            this[key] = ret;
          }
        });

        return root[inside] = ret;
      },

      // Traverse a language definition with Depth First Search
      DFS: function (o, callback, type, visited) {
        visited = visited || {};
        for (var i in o) {
          if (o.hasOwnProperty(i)) {
            callback.call(o, i, o[i], type || i);

            if (_.util.type(o[i]) === 'Object' && !visited[_.util.objId(o[i])]) {
              visited[_.util.objId(o[i])] = true;
              _.languages.DFS(o[i], callback, null, visited);
            }
            else if (_.util.type(o[i]) === 'Array' && !visited[_.util.objId(o[i])]) {
              visited[_.util.objId(o[i])] = true;
              _.languages.DFS(o[i], callback, i, visited);
            }
          }
        }
      }
    },
    plugins: {},

    highlightAll: function (async, callback) {
      var env = {
        callback: callback,
        selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
      };

      _.hooks.run("before-highlightall", env);

      var elements = env.elements || document.querySelectorAll(env.selector);

      for (var i = 0, element; element = elements[i++];) {
        _.highlightElement(element, async === true, env.callback);
      }
    },

    highlightElement: function (element, async, callback) {
      // Find language
      var language, grammar, parent = element;

      while (parent && !lang.test(parent.className)) {
        parent = parent.parentNode;
      }

      if (parent) {
        language = (parent.className.match(lang) || [, ''])[1].toLowerCase();
        grammar = _.languages[language];
      }

      // Set language on the element, if not present
      element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

      // Set language on the parent, for styling
      parent = element.parentNode;

      if (/pre/i.test(parent.nodeName)) {
        parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
      }

      var code = element.textContent;

      var env = {
        element: element,
        language: language,
        grammar: grammar,
        code: code
      };

      _.hooks.run('before-sanity-check', env);

      if (!env.code || !env.grammar) {
        if (env.code) {
          _.hooks.run('before-highlight', env);
          env.element.textContent = env.code;
          _.hooks.run('after-highlight', env);
        }
        _.hooks.run('complete', env);
        return;
      }

      _.hooks.run('before-highlight', env);

      if (async && _self.Worker) {
        var worker = new Worker(_.filename);

        worker.onmessage = function (evt) {
          env.highlightedCode = evt.data;

          _.hooks.run('before-insert', env);

          env.element.innerHTML = env.highlightedCode;

          callback && callback.call(env.element);
          _.hooks.run('after-highlight', env);
          _.hooks.run('complete', env);
        };

        worker.postMessage(JSON.stringify({
          language: env.language,
          code: env.code,
          immediateClose: true
        }));
      }
      else {
        env.highlightedCode = _.highlight(env.code, env.grammar, env.language);

        _.hooks.run('before-insert', env);

        env.element.innerHTML = env.highlightedCode;

        callback && callback.call(element);

        _.hooks.run('after-highlight', env);
        _.hooks.run('complete', env);
      }
    },

    highlight: function (text, grammar, language) {
      var tokens = _.tokenize(text, grammar);
      return Token.stringify(_.util.encode(tokens), language);
    },

    matchGrammar: function (text, strarr, grammar, index, startPos, oneshot, target) {
      var Token = _.Token;

      for (var token in grammar) {
        if (!grammar.hasOwnProperty(token) || !grammar[token]) {
          continue;
        }

        if (token == target) {
          return;
        }

        var patterns = grammar[token];
        patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

        for (var j = 0; j < patterns.length; ++j) {
          var pattern = patterns[j],
            inside = pattern.inside,
            lookbehind = !!pattern.lookbehind,
            greedy = !!pattern.greedy,
            lookbehindLength = 0,
            alias = pattern.alias;

          if (greedy && !pattern.pattern.global) {
            // Without the global flag, lastIndex won't work
            var flags = pattern.pattern.toString().match(/[imuy]*$/)[0];
            pattern.pattern = RegExp(pattern.pattern.source, flags + "g");
          }

          pattern = pattern.pattern || pattern;

          // Don’t cache length as it changes during the loop
          for (var i = index, pos = startPos; i < strarr.length; pos += strarr[i].length, ++i) {

            var str = strarr[i];

            if (strarr.length > text.length) {
              // Something went terribly wrong, ABORT, ABORT!
              return;
            }

            if (str instanceof Token) {
              continue;
            }

            pattern.lastIndex = 0;

            var match = pattern.exec(str),
              delNum = 1;

            // Greedy patterns can override/remove up to two previously matched tokens
            if (!match && greedy && i != strarr.length - 1) {
              pattern.lastIndex = pos;
              match = pattern.exec(text);
              if (!match) {
                break;
              }

              var from = match.index + (lookbehind ? match[1].length : 0),
                to = match.index + match[0].length,
                k = i,
                p = pos;

              for (var len = strarr.length; k < len && (p < to || (!strarr[k].type && !strarr[k - 1].greedy)); ++k) {
                p += strarr[k].length;
                // Move the index i to the element in strarr that is closest to from
                if (from >= p) {
                  ++i;
                  pos = p;
                }
              }

              /*
                           * If strarr[i] is a Token, then the match starts inside another Token, which is invalid
                           * If strarr[k - 1] is greedy we are in conflict with another greedy pattern
                           */
              if (strarr[i] instanceof Token || strarr[k - 1].greedy) {
                continue;
              }

              // Number of tokens to delete and replace with the new match
              delNum = k - i;
              str = text.slice(pos, p);
              match.index -= pos;
            }

            if (!match) {
              if (oneshot) {
                break;
              }

              continue;
            }

            if (lookbehind) {
              lookbehindLength = match[1].length;
            }

            var from = match.index + lookbehindLength,
              match = match[0].slice(lookbehindLength),
              to = from + match.length,
              before = str.slice(0, from),
              after = str.slice(to);

            var args = [i, delNum];

            if (before) {
              ++i;
              pos += before.length;
              args.push(before);
            }

            var wrapped = new Token(token, inside ? _.tokenize(match, inside) : match, alias, match, greedy);

            args.push(wrapped);

            if (after) {
              args.push(after);
            }

            Array.prototype.splice.apply(strarr, args);

            if (delNum != 1)
              _.matchGrammar(text, strarr, grammar, i, pos, true, token);

            if (oneshot)
              break;
          }
        }
      }
    },

    tokenize: function (text, grammar, language) {
      var strarr = [text];

      var rest = grammar.rest;

      if (rest) {
        for (var token in rest) {
          grammar[token] = rest[token];
        }

        delete grammar.rest;
      }

      _.matchGrammar(text, strarr, grammar, 0, 0, false);

      return strarr;
    },

    hooks: {
      all: {},

      add: function (name, callback) {
        var hooks = _.hooks.all;

        hooks[name] = hooks[name] || [];

        hooks[name].push(callback);
      },

      run: function (name, env) {
        var callbacks = _.hooks.all[name];

        if (!callbacks || !callbacks.length) {
          return;
        }

        for (var i = 0, callback; callback = callbacks[i++];) {
          callback(env);
        }
      }
    }
  };

  var Token = _.Token = function (type, content, alias, matchedStr, greedy) {
    this.type = type;
    this.content = content;
    this.alias = alias;
    // Copy of the full string this token was created from
    this.length = (matchedStr || "").length | 0;
    this.greedy = !!greedy;
  };

  Token.stringify = function (o, language, parent) {
    if (typeof o == 'string') {
      return o;
    }

    if (_.util.type(o) === 'Array') {
      return o.map(function (element) {
        return Token.stringify(element, language, o);
      }).join('');
    }

    var env = {
      type: o.type,
      content: Token.stringify(o.content, language, parent),
      tag: 'span',
      classes: ['token', o.type],
      attributes: {},
      language: language,
      parent: parent
    };

    if (o.alias) {
      var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
      Array.prototype.push.apply(env.classes, aliases);
    }

    _.hooks.run('wrap', env);

    var attributes = Object.keys(env.attributes).map(function (name) {
      return name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
    }).join(' ');

    return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + (attributes ? ' ' + attributes : '') + '>' + env.content + '</' + env.tag + '>';

  };

  if (!_self.document) {
    if (!_self.addEventListener) {
      // in Node.js
      return _self.Prism;
    }
    // In worker
    _self.addEventListener('message', function (evt) {
      var message = JSON.parse(evt.data),
        lang = message.language,
        code = message.code,
        immediateClose = message.immediateClose;

      _self.postMessage(_.highlight(code, _.languages[lang], lang));
      if (immediateClose) {
        _self.close();
      }
    }, false);

    return _self.Prism;
  }

//Get current script and highlight
  var script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

  if (script) {
    _.filename = script.src;

    if (!_.manual && !script.hasAttribute('data-manual')) {
      if (document.readyState !== "loading") {
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(_.highlightAll);
        } else {
          window.setTimeout(_.highlightAll, 16);
        }
      }
      else {
        document.addEventListener('DOMContentLoaded', _.highlightAll);
      }
    }
  }

  return _self.Prism;

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== 'undefined') {
  global.Prism = Prism;
}
;
Prism.languages.markup = {
  'comment': /<!--[\s\S]*?-->/,
  'prolog': /<\?[\s\S]+?\?>/,
  'doctype': /<!DOCTYPE[\s\S]+?>/i,
  'cdata': /<!\[CDATA\[[\s\S]*?]]>/i,
  'tag': {
    pattern: /<\/?(?!\d)[^\s>\/=$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/i,
    inside: {
      'tag': {
        pattern: /^<\/?[^\s>\/]+/i,
        inside: {
          'punctuation': /^<\/?/,
          'namespace': /^[^\s>\/:]+:/
        }
      },
      'attr-value': {
        pattern: /=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+)/i,
        inside: {
          'punctuation': [
            /^=/,
            {
              pattern: /(^|[^\\])["']/,
              lookbehind: true
            }
          ]
        }
      },
      'punctuation': /\/?>/,
      'attr-name': {
        pattern: /[^\s>\/]+/,
        inside: {
          'namespace': /^[^\s>\/:]+:/
        }
      }

    }
  },
  'entity': /&#?[\da-z]{1,8};/i
};

Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
  Prism.languages.markup['entity'];

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function (env) {

  if (env.type === 'entity') {
    env.attributes['title'] = env.content.replace(/&amp;/, '&');
  }
});

Prism.languages.xml = Prism.languages.markup;
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;

Prism.languages.css = {
  'comment': /\/\*[\s\S]*?\*\//,
  'atrule': {
    pattern: /@[\w-]+?.*?(?:;|(?=\s*\{))/i,
    inside: {
      'rule': /@[\w-]+/
      // See rest below
    }
  },
  'url': /url\((?:(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
  'selector': /[^{}\s][^{};]*?(?=\s*\{)/,
  'string': {
    pattern: /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: true
  },
  'property': /[\w-]+(?=\s*:)/i,
  'important': /\B!important\b/i,
  'function': /[-a-z0-9]+(?=\()/i,
  'punctuation': /[(){};:]/
};

Prism.languages.css['atrule'].inside.rest = Prism.util.clone(Prism.languages.css);

if (Prism.languages.markup) {
  Prism.languages.insertBefore('markup', 'tag', {
    'style': {
      pattern: /(<style[\s\S]*?>)[\s\S]*?(?=<\/style>)/i,
      lookbehind: true,
      inside: Prism.languages.css,
      alias: 'language-css'
    }
  });

  Prism.languages.insertBefore('inside', 'attr-value', {
    'style-attr': {
      pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
      inside: {
        'attr-name': {
          pattern: /^\s*style/i,
          inside: Prism.languages.markup.tag.inside
        },
        'punctuation': /^\s*=\s*['"]|['"]\s*$/,
        'attr-value': {
          pattern: /.+/i,
          inside: Prism.languages.css
        }
      },
      alias: 'language-css'
    }
  }, Prism.languages.markup.tag);
}
;
Prism.languages.clike = {
  'comment': [
    {
      pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
      lookbehind: true
    },
    {
      pattern: /(^|[^\\:])\/\/.*/,
      lookbehind: true
    }
  ],
  'string': {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: true
  },
  'class-name': {
    pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i,
    lookbehind: true,
    inside: {
      punctuation: /[.\\]/
    }
  },
  'keyword': /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
  'boolean': /\b(?:true|false)\b/,
  'function': /[a-z0-9_]+(?=\()/i,
  'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
  'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
  'punctuation': /[{}[\];(),.:]/
};

Prism.languages.javascript = Prism.languages.extend('clike', {
  'keyword': /\b(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
  'number': /\b-?(?:0[xX][\dA-Fa-f]+|0[bB][01]+|0[oO][0-7]+|\d*\.?\d+(?:[Ee][+-]?\d+)?|NaN|Infinity)\b/,
  // Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
  'function': /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\s*\()/i,
  'operator': /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/
});

Prism.languages.insertBefore('javascript', 'keyword', {
  'regex': {
    pattern: /(^|[^/])\/(?!\/)(\[[^\]\r\n]+]|\\.|[^/\\\[\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
    lookbehind: true,
    greedy: true
  },
  // This must be declared before keyword because we use "function" inside the look-forward
  'function-variable': {
    pattern: /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\s*=\s*(?:function\b|(?:\([^()]*\)|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)\s*=>))/i,
    alias: 'function'
  }
});

Prism.languages.insertBefore('javascript', 'string', {
  'template-string': {
    pattern: /`(?:\\[\s\S]|[^\\`])*`/,
    greedy: true,
    inside: {
      'interpolation': {
        pattern: /\$\{[^}]+\}/,
        inside: {
          'interpolation-punctuation': {
            pattern: /^\$\{|\}$/,
            alias: 'punctuation'
          },
          rest: Prism.languages.javascript
        }
      },
      'string': /[\s\S]+/
    }
  }
});

if (Prism.languages.markup) {
  Prism.languages.insertBefore('markup', 'tag', {
    'script': {
      pattern: /(<script[\s\S]*?>)[\s\S]*?(?=<\/script>)/i,
      lookbehind: true,
      inside: Prism.languages.javascript,
      alias: 'language-javascript'
    }
  });
}

Prism.languages.js = Prism.languages.javascript;

(function (Prism) {

  var attributes = {
    pattern: /(^[ \t]*)\[(?!\[)(?:(["'$`])(?:(?!\2)[^\\]|\\.)*\2|\[(?:[^\]\\]|\\.)*\]|[^\]\\]|\\.)*\]/m,
    lookbehind: true,
    inside: {
      'quoted': {
        pattern: /([$`])(?:(?!\1)[^\\]|\\.)*\1/,
        inside: {
          'punctuation': /^[$`]|[$`]$/
        }
      },
      'interpreted': {
        pattern: /'(?:[^'\\]|\\.)*'/,
        inside: {
          'punctuation': /^'|'$/
          // See rest below
        }
      },
      'string': /"(?:[^"\\]|\\.)*"/,
      'variable': /\w+(?==)/,
      'punctuation': /^\[|\]$|,/,
      'operator': /=/,
      // The negative look-ahead prevents blank matches
      'attr-value': /(?!^\s+$).+/
    }
  };
  Prism.languages.asciidoc = {
    'comment-block': {
      pattern: /^(\/{4,})(?:\r?\n|\r)(?:[\s\S]*(?:\r?\n|\r))??\1/m,
      alias: 'comment'
    },
    'table': {
      pattern: /^\|={3,}(?:(?:\r?\n|\r).*)*?(?:\r?\n|\r)\|={3,}$/m,
      inside: {
        'specifiers': {
          pattern: /(?!\|)(?:(?:(?:\d+(?:\.\d+)?|\.\d+)[+*])?(?:[<^>](?:\.[<^>])?|\.[<^>])?[a-z]*)(?=\|)/,
          alias: 'attr-value'
        },
        'punctuation': {
          pattern: /(^|[^\\])[|!]=*/,
          lookbehind: true
        }
        // See rest below
      }
    },

    'passthrough-block': {
      pattern: /^(\+{4,})(?:\r?\n|\r)(?:[\s\S]*(?:\r?\n|\r))??\1$/m,
      inside: {
        'punctuation': /^\++|\++$/
        // See rest below
      }
    },
    // Literal blocks and listing blocks
    'literal-block': {
      pattern: /^(-{4,}|\.{4,})(?:\r?\n|\r)(?:[\s\S]*(?:\r?\n|\r))??\1$/m,
      inside: {
        'punctuation': /^(?:-+|\.+)|(?:-+|\.+)$/
        // See rest below
      }
    },
    // Sidebar blocks, quote blocks, example blocks and open blocks
    'other-block': {
      pattern: /^(--|\*{4,}|_{4,}|={4,})(?:\r?\n|\r)(?:[\s\S]*(?:\r?\n|\r))??\1$/m,
      inside: {
        'punctuation': /^(?:-+|\*+|_+|=+)|(?:-+|\*+|_+|=+)$/
        // See rest below
      }
    },

    // list-punctuation and list-label must appear before indented-block
    'list-punctuation': {
      pattern: /(^[ \t]*)(?:-|\*{1,5}|\.{1,5}|(?:[a-z]|\d+)\.|[xvi]+\))(?= )/im,
      lookbehind: true,
      alias: 'punctuation'
    },
    'list-label': {
      pattern: /(^[ \t]*)[a-z\d].+(?::{2,4}|;;)(?=\s)/im,
      lookbehind: true,
      alias: 'symbol'
    },
    'indented-block': {
      pattern: /((\r?\n|\r)\2)([ \t]+)\S.*(?:(?:\r?\n|\r)\3.+)*(?=\2{2}|$)/,
      lookbehind: true
    },

    'comment': /^\/\/.*/m,
    'title': {
      pattern: /^.+(?:\r?\n|\r)(?:={3,}|-{3,}|~{3,}|\^{3,}|\+{3,})$|^={1,5} +.+|^\.(?![\s.]).*/m,
      alias: 'important',
      inside: {
        'punctuation': /^(?:\.|=+)|(?:=+|-+|~+|\^+|\++)$/
        // See rest below
      }
    },
    'attribute-entry': {
      pattern: /^:[^:\r\n]+:(?: .*?(?: \+(?:\r?\n|\r).*?)*)?$/m,
      alias: 'tag'
    },
    'attributes': attributes,
    'hr': {
      pattern: /^'{3,}$/m,
      alias: 'punctuation'
    },
    'page-break': {
      pattern: /^<{3,}$/m,
      alias: 'punctuation'
    },
    'admonition': {
      pattern: /^(?:TIP|NOTE|IMPORTANT|WARNING|CAUTION):/m,
      alias: 'keyword'
    },
    'callout': [
      {
        pattern: /(^[ \t]*)<?\d*>/m,
        lookbehind: true,
        alias: 'symbol'
      },
      {
        pattern: /<\d+>/,
        alias: 'symbol'
      }
    ],
    'macro': {
      pattern: /\b[a-z\d][a-z\d-]*::?(?:(?:\S+)??\[(?:[^\]\\"]|(["'])(?:(?!\1)[^\\]|\\.)*\1|\\.)*\])/,
      inside: {
        'function': /^[a-z\d-]+(?=:)/,
        'punctuation': /^::?/,
        'attributes': {
          pattern: /(?:\[(?:[^\]\\"]|(["'])(?:(?!\1)[^\\]|\\.)*\1|\\.)*\])/,
          inside: attributes.inside
        }
      }
    },
    'inline': {
      /*
            The initial look-behind prevents the highlighting of escaped quoted text.

            Quoted text can be multi-line but cannot span an empty line.
            All quoted text can have attributes before [foobar, 'foobar', baz="bar"].

            First, we handle the constrained quotes.
            Those must be bounded by non-word chars and cannot have spaces between the delimiter and the first char.
            They are, in order: _emphasis_, ``double quotes'', `single quotes', `monospace`, 'emphasis', *strong*, +monospace+ and #unquoted#

            Then we handle the unconstrained quotes.
            Those do not have the restrictions of the constrained quotes.
            They are, in order: __emphasis__, **strong**, ++monospace++, +++passthrough+++, ##unquoted##, $$passthrough$$, ~subscript~, ^superscript^, {attribute-reference}, [[anchor]], [[[bibliography anchor]]], <<xref>>, (((indexes))) and ((indexes))
             */
      pattern: /(^|[^\\])(?:(?:\B\[(?:[^\]\\"]|(["'])(?:(?!\2)[^\\]|\\.)*\2|\\.)*\])?(?:\b_(?!\s)(?: _|[^_\\\r\n]|\\.)+(?:(?:\r?\n|\r)(?: _|[^_\\\r\n]|\\.)+)*_\b|\B``(?!\s).+?(?:(?:\r?\n|\r).+?)*''\B|\B`(?!\s)(?: ['`]|.)+?(?:(?:\r?\n|\r)(?: ['`]|.)+?)*['`]\B|\B(['*+#])(?!\s)(?: \3|(?!\3)[^\\\r\n]|\\.)+(?:(?:\r?\n|\r)(?: \3|(?!\3)[^\\\r\n]|\\.)+)*\3\B)|(?:\[(?:[^\]\\"]|(["'])(?:(?!\4)[^\\]|\\.)*\4|\\.)*\])?(?:(__|\*\*|\+\+\+?|##|\$\$|[~^]).+?(?:(?:\r?\n|\r).+?)*\5|\{[^}\r\n]+\}|\[\[\[?.+?(?:(?:\r?\n|\r).+?)*\]?\]\]|<<.+?(?:(?:\r?\n|\r).+?)*>>|\(\(\(?.+?(?:(?:\r?\n|\r).+?)*\)?\)\)))/m,
      lookbehind: true,
      inside: {
        'attributes': attributes,
        'url': {
          pattern: /^(?:\[\[\[?.+?\]?\]\]|<<.+?>>)$/,
          inside: {
            'punctuation': /^(?:\[\[\[?|<<)|(?:\]\]\]?|>>)$/
          }
        },
        'attribute-ref': {
          pattern: /^\{.+\}$/,
          inside: {
            'variable': {
              pattern: /(^\{)[a-z\d,+_-]+/,
              lookbehind: true
            },
            'operator': /^[=?!#%@$]|!(?=[:}])/,
            'punctuation': /^\{|\}$|::?/
          }
        },
        'italic': {
          pattern: /^(['_])[\s\S]+\1$/,
          inside: {
            'punctuation': /^(?:''?|__?)|(?:''?|__?)$/
          }
        },
        'bold': {
          pattern: /^\*[\s\S]+\*$/,
          inside: {
            punctuation: /^\*\*?|\*\*?$/
          }
        },
        'punctuation': /^(?:``?|\+{1,3}|##?|\$\$|[~^]|\(\(\(?)|(?:''?|\+{1,3}|##?|\$\$|[~^`]|\)?\)\))$/
      }
    },
    'replacement': {
      pattern: /\((?:C|TM|R)\)/,
      alias: 'builtin'
    },
    'entity': /&#?[\da-z]{1,8};/i,
    'line-continuation': {
      pattern: /(^| )\+$/m,
      lookbehind: true,
      alias: 'punctuation'
    }
  };


  // Allow some nesting. There is no recursion though, so cloning should not be needed.

  attributes.inside['interpreted'].inside.rest = {
    'macro': Prism.languages.asciidoc['macro'],
    'inline': Prism.languages.asciidoc['inline'],
    'replacement': Prism.languages.asciidoc['replacement'],
    'entity': Prism.languages.asciidoc['entity']
  };

  Prism.languages.asciidoc['passthrough-block'].inside.rest = {
    'macro': Prism.languages.asciidoc['macro']
  };

  Prism.languages.asciidoc['literal-block'].inside.rest = {
    'callout': Prism.languages.asciidoc['callout']
  };

  Prism.languages.asciidoc['table'].inside.rest = {
    'comment-block': Prism.languages.asciidoc['comment-block'],
    'passthrough-block': Prism.languages.asciidoc['passthrough-block'],
    'literal-block': Prism.languages.asciidoc['literal-block'],
    'other-block': Prism.languages.asciidoc['other-block'],
    'list-punctuation': Prism.languages.asciidoc['list-punctuation'],
    'indented-block': Prism.languages.asciidoc['indented-block'],
    'comment': Prism.languages.asciidoc['comment'],
    'title': Prism.languages.asciidoc['title'],
    'attribute-entry': Prism.languages.asciidoc['attribute-entry'],
    'attributes': Prism.languages.asciidoc['attributes'],
    'hr': Prism.languages.asciidoc['hr'],
    'page-break': Prism.languages.asciidoc['page-break'],
    'admonition': Prism.languages.asciidoc['admonition'],
    'list-label': Prism.languages.asciidoc['list-label'],
    'callout': Prism.languages.asciidoc['callout'],
    'macro': Prism.languages.asciidoc['macro'],
    'inline': Prism.languages.asciidoc['inline'],
    'replacement': Prism.languages.asciidoc['replacement'],
    'entity': Prism.languages.asciidoc['entity'],
    'line-continuation': Prism.languages.asciidoc['line-continuation']
  };

  Prism.languages.asciidoc['other-block'].inside.rest = {
    'table': Prism.languages.asciidoc['table'],
    'list-punctuation': Prism.languages.asciidoc['list-punctuation'],
    'indented-block': Prism.languages.asciidoc['indented-block'],
    'comment': Prism.languages.asciidoc['comment'],
    'attribute-entry': Prism.languages.asciidoc['attribute-entry'],
    'attributes': Prism.languages.asciidoc['attributes'],
    'hr': Prism.languages.asciidoc['hr'],
    'page-break': Prism.languages.asciidoc['page-break'],
    'admonition': Prism.languages.asciidoc['admonition'],
    'list-label': Prism.languages.asciidoc['list-label'],
    'macro': Prism.languages.asciidoc['macro'],
    'inline': Prism.languages.asciidoc['inline'],
    'replacement': Prism.languages.asciidoc['replacement'],
    'entity': Prism.languages.asciidoc['entity'],
    'line-continuation': Prism.languages.asciidoc['line-continuation']
  };

  Prism.languages.asciidoc['title'].inside.rest = {
    'macro': Prism.languages.asciidoc['macro'],
    'inline': Prism.languages.asciidoc['inline'],
    'replacement': Prism.languages.asciidoc['replacement'],
    'entity': Prism.languages.asciidoc['entity']
  };

  // Plugin to make entity title show the real entity, idea by Roman Komarov
  Prism.hooks.add('wrap', function (env) {
    if (env.type === 'entity') {
      env.attributes['title'] = env.content.replace(/&amp;/, '&');
    }
  });
}(Prism));
(function (Prism) {
  var insideString = {
    variable: [
      // Arithmetic Environment
      {
        pattern: /\$?\(\([\s\S]+?\)\)/,
        inside: {
          // If there is a $ sign at the beginning highlight $(( and )) as variable
          variable: [{
            pattern: /(^\$\(\([\s\S]+)\)\)/,
            lookbehind: true
          },
            /^\$\(\(/
          ],
          number: /\b-?(?:0x[\dA-Fa-f]+|\d*\.?\d+(?:[Ee]-?\d+)?)\b/,
          // Operators according to https://www.gnu.org/software/bash/manual/bashref.html#Shell-Arithmetic
          operator: /--?|-=|\+\+?|\+=|!=?|~|\*\*?|\*=|\/=?|%=?|<<=?|>>=?|<=?|>=?|==?|&&?|&=|\^=?|\|\|?|\|=|\?|:/,
          // If there is no $ sign at the beginning highlight (( and )) as punctuation
          punctuation: /\(\(?|\)\)?|,|;/
        }
      },
      // Command Substitution
      {
        pattern: /\$\([^)]+\)|`[^`]+`/,
        inside: {
          variable: /^\$\(|^`|\)$|`$/
        }
      },
      /\$(?:[\w#?*!@]+|\{[^}]+\})/i
    ]
  };

  Prism.languages.bash = {
    'shebang': {
      pattern: /^#!\s*\/bin\/bash|^#!\s*\/bin\/sh/,
      alias: 'important'
    },
    'comment': {
      pattern: /(^|[^"{\\])#.*/,
      lookbehind: true
    },
    'string': [
      //Support for Here-Documents https://en.wikipedia.org/wiki/Here_document
      {
        pattern: /((?:^|[^<])<<\s*)["']?(\w+?)["']?\s*\r?\n(?:[\s\S])*?\r?\n\2/,
        lookbehind: true,
        greedy: true,
        inside: insideString
      },
      {
        pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/,
        greedy: true,
        inside: insideString
      }
    ],
    'variable': insideString.variable,
    // Originally based on http://ss64.com/bash/
    'function': {
      pattern: /(^|[\s;|&])(?:alias|apropos|apt-get|aptitude|aspell|awk|basename|bash|bc|bg|builtin|bzip2|cal|cat|cd|cfdisk|chgrp|chmod|chown|chroot|chkconfig|cksum|clear|cmp|comm|command|cp|cron|crontab|csplit|cut|date|dc|dd|ddrescue|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|du|egrep|eject|enable|env|ethtool|eval|exec|expand|expect|export|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|getopts|git|grep|groupadd|groupdel|groupmod|groups|gzip|hash|head|help|hg|history|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|jobs|join|kill|killall|less|link|ln|locate|logname|logout|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|make|man|mkdir|mkfifo|mkisofs|mknod|more|most|mount|mtools|mtr|mv|mmv|nano|netstat|nice|nl|nohup|notify-send|npm|nslookup|open|op|passwd|paste|pathchk|ping|pkill|popd|pr|printcap|printenv|printf|ps|pushd|pv|pwd|quota|quotacheck|quotactl|ram|rar|rcp|read|readarray|readonly|reboot|rename|renice|remsync|rev|rm|rmdir|rsync|screen|scp|sdiff|sed|seq|service|sftp|shift|shopt|shutdown|sleep|slocate|sort|source|split|ssh|stat|strace|su|sudo|sum|suspend|sync|tail|tar|tee|test|time|timeout|times|touch|top|traceroute|trap|tr|tsort|tty|type|ulimit|umask|umount|unalias|uname|unexpand|uniq|units|unrar|unshar|uptime|useradd|userdel|usermod|users|uuencode|uudecode|v|vdir|vi|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yes|zip)(?=$|[\s;|&])/,
      lookbehind: true
    },
    'keyword': {
      pattern: /(^|[\s;|&])(?:let|:|\.|if|then|else|elif|fi|for|break|continue|while|in|case|function|select|do|done|until|echo|exit|return|set|declare)(?=$|[\s;|&])/,
      lookbehind: true
    },
    'boolean': {
      pattern: /(^|[\s;|&])(?:true|false)(?=$|[\s;|&])/,
      lookbehind: true
    },
    'operator': /&&?|\|\|?|==?|!=?|<<<?|>>|<=?|>=?|=~/,
    'punctuation': /\$?\(\(?|\)\)?|\.\.|[{}[\];]/
  };

  var inside = insideString.variable[1].inside;
  inside['function'] = Prism.languages.bash['function'];
  inside.keyword = Prism.languages.bash.keyword;
  inside.boolean = Prism.languages.bash.boolean;
  inside.operator = Prism.languages.bash.operator;
  inside.punctuation = Prism.languages.bash.punctuation;
})(Prism);

(function (Prism) {
  var variable = /%%?[~:\w]+%?|!\S+!/;
  var parameter = {
    pattern: /\/[a-z?]+(?=[ :]|$):?|-[a-z]\b|--[a-z-]+\b/im,
    alias: 'attr-name',
    inside: {
      'punctuation': /:/
    }
  };
  var string = /"[^"]*"/;
  var number = /(?:\b|-)\d+\b/;

  Prism.languages.batch = {
    'comment': [
      /^::.*/m,
      {
        pattern: /((?:^|[&(])[ \t]*)rem\b(?:[^^&)\r\n]|\^(?:\r\n|[\s\S]))*/im,
        lookbehind: true
      }
    ],
    'label': {
      pattern: /^:.*/m,
      alias: 'property'
    },
    'command': [
      {
        // FOR command
        pattern: /((?:^|[&(])[ \t]*)for(?: ?\/[a-z?](?:[ :](?:"[^"]*"|\S+))?)* \S+ in \([^)]+\) do/im,
        lookbehind: true,
        inside: {
          'keyword': /^for\b|\b(?:in|do)\b/i,
          'string': string,
          'parameter': parameter,
          'variable': variable,
          'number': number,
          'punctuation': /[()',]/
        }
      },
      {
        // IF command
        pattern: /((?:^|[&(])[ \t]*)if(?: ?\/[a-z?](?:[ :](?:"[^"]*"|\S+))?)* (?:not )?(?:cmdextversion \d+|defined \w+|errorlevel \d+|exist \S+|(?:"[^"]*"|\S+)?(?:==| (?:equ|neq|lss|leq|gtr|geq) )(?:"[^"]*"|\S+))/im,
        lookbehind: true,
        inside: {
          'keyword': /^if\b|\b(?:not|cmdextversion|defined|errorlevel|exist)\b/i,
          'string': string,
          'parameter': parameter,
          'variable': variable,
          'number': number,
          'operator': /\^|==|\b(?:equ|neq|lss|leq|gtr|geq)\b/i
        }
      },
      {
        // ELSE command
        pattern: /((?:^|[&()])[ \t]*)else\b/im,
        lookbehind: true,
        inside: {
          'keyword': /^else\b/i
        }
      },
      {
        // SET command
        pattern: /((?:^|[&(])[ \t]*)set(?: ?\/[a-z](?:[ :](?:"[^"]*"|\S+))?)* (?:[^^&)\r\n]|\^(?:\r\n|[\s\S]))*/im,
        lookbehind: true,
        inside: {
          'keyword': /^set\b/i,
          'string': string,
          'parameter': parameter,
          'variable': [
            variable,
            /\w+(?=(?:[*\/%+\-&^|]|<<|>>)?=)/
          ],
          'number': number,
          'operator': /[*\/%+\-&^|]=?|<<=?|>>=?|[!~_=]/,
          'punctuation': /[()',]/
        }
      },
      {
        // Other commands
        pattern: /((?:^|[&(])[ \t]*@?)\w+\b(?:[^^&)\r\n]|\^(?:\r\n|[\s\S]))*/im,
        lookbehind: true,
        inside: {
          'keyword': /^\w+\b/i,
          'string': string,
          'parameter': parameter,
          'label': {
            pattern: /(^\s*):\S+/m,
            lookbehind: true,
            alias: 'property'
          },
          'variable': variable,
          'number': number,
          'operator': /\^/
        }
      }
    ],
    'operator': /[&@]/,
    'punctuation': /[()']/
  };
}(Prism));
Prism.languages.git = {
  /*
     * A simple one line comment like in a git status command
     * For instance:
     * $ git status
     * # On branch infinite-scroll
     * # Your branch and 'origin/sharedBranches/frontendTeam/infinite-scroll' have diverged,
     * # and have 1 and 2 different commits each, respectively.
     * nothing to commit (working directory clean)
     */
  'comment': /^#.*/m,

  /*
     * Regexp to match the changed lines in a git diff output. Check the example below.
     */
  'deleted': /^[-–].*/m,
  'inserted': /^\+.*/m,

  /*
     * a string (double and simple quote)
     */
  'string': /("|')(?:\\.|(?!\1)[^\\\r\n])*\1/m,

  /*
     * a git command. It starts with a random prompt finishing by a $, then "git" then some other parameters
     * For instance:
     * $ git add file.txt
     */
  'command': {
    pattern: /^.*\$ git .*$/m,
    inside: {
      /*
             * A git command can contain a parameter starting by a single or a double dash followed by a string
             * For instance:
             * $ git diff --cached
             * $ git log -p
             */
      'parameter': /\s--?\w+/m
    }
  },

  /*
     * Coordinates displayed in a git diff command
     * For instance:
     * $ git diff
     * diff --git file.txt file.txt
     * index 6214953..1d54a52 100644
     * --- file.txt
     * +++ file.txt
     * @@ -1 +1,2 @@
     * -Here's my tetx file
     * +Here's my text file
     * +And this is the second line
     */
  'coord': /^@@.*@@$/m,

  /*
     * Match a "commit [SHA1]" line in a git log output.
     * For instance:
     * $ git log
     * commit a11a14ef7e26f2ca62d4b35eac455ce636d0dc09
     * Author: lgiraudel
     * Date:   Mon Feb 17 11:18:34 2014 +0100
     *
     *     Add of a new line
     */
  'commit_sha1': /^commit \w{40}$/m
};

(function (Prism) {

  var handlebars_pattern = /\{\{\{[\s\S]+?\}\}\}|\{\{[\s\S]+?\}\}/;

  Prism.languages.handlebars = Prism.languages.extend('markup', {
    'handlebars': {
      pattern: handlebars_pattern,
      inside: {
        'delimiter': {
          pattern: /^\{\{\{?|\}\}\}?$/i,
          alias: 'punctuation'
        },
        'string': /(["'])(?:\\.|(?!\1)[^\\\r\n])*\1/,
        'number': /\b-?(?:0x[\dA-Fa-f]+|\d*\.?\d+(?:[Ee][+-]?\d+)?)\b/,
        'boolean': /\b(?:true|false)\b/,
        'block': {
          pattern: /^(\s*~?\s*)[#\/]\S+?(?=\s*~?\s*$|\s)/i,
          lookbehind: true,
          alias: 'keyword'
        },
        'brackets': {
          pattern: /\[[^\]]+\]/,
          inside: {
            punctuation: /\[|\]/,
            variable: /[\s\S]+/
          }
        },
        'punctuation': /[!"#%&'()*+,.\/;<=>@\[\\\]^`{|}~]/,
        'variable': /[^!"#%&'()*+,.\/;<=>@\[\\\]^`{|}~\s]+/
      }
    }
  });

  // Comments are inserted at top so that they can
  // surround markup
  Prism.languages.insertBefore('handlebars', 'tag', {
    'handlebars-comment': {
      pattern: /\{\{![\s\S]*?\}\}/,
      alias: ['handlebars', 'comment']
    }
  });

  // Tokenize all inline Handlebars expressions that are wrapped in {{ }} or {{{ }}}
  // This allows for easy Handlebars + markup highlighting
  Prism.hooks.add('before-highlight', function (env) {
    if (env.language !== 'handlebars') {
      return;
    }

    env.tokenStack = [];

    env.backupCode = env.code;
    env.code = env.code.replace(handlebars_pattern, function (match) {
      var i = env.tokenStack.length;
      // Check for existing strings
      while (env.backupCode.indexOf('___HANDLEBARS' + i + '___') !== -1)
        ++i;

      // Create a sparse array
      env.tokenStack[i] = match;

      return '___HANDLEBARS' + i + '___';
    });
  });

  // Restore env.code for other plugins (e.g. line-numbers)
  Prism.hooks.add('before-insert', function (env) {
    if (env.language === 'handlebars') {
      env.code = env.backupCode;
      delete env.backupCode;
    }
  });

  // Re-insert the tokens after highlighting
  // and highlight them with defined grammar
  Prism.hooks.add('after-highlight', function (env) {
    if (env.language !== 'handlebars') {
      return;
    }

    for (var i = 0, keys = Object.keys(env.tokenStack); i < keys.length; ++i) {
      var k = keys[i];
      var t = env.tokenStack[k];

      // The replace prevents $$, $&, $`, $', $n, $nn from being interpreted as special patterns
      env.highlightedCode = env.highlightedCode.replace('___HANDLEBARS' + k + '___', Prism.highlight(t, env.grammar, 'handlebars').replace(/\$/g, '$$$$'));
    }

    env.element.innerHTML = env.highlightedCode;
  });

}(Prism));

Prism.languages.java = Prism.languages.extend('clike', {
  'keyword': /\b(?:abstract|continue|for|new|switch|assert|default|goto|package|synchronized|boolean|do|if|private|this|break|double|implements|protected|throw|byte|else|import|public|throws|case|enum|instanceof|return|transient|catch|extends|int|short|try|char|final|interface|static|void|class|finally|long|strictfp|volatile|const|float|native|super|while)\b/,
  'number': /\b0b[01]+\b|\b0x[\da-f]*\.?[\da-fp\-]+\b|\b\d*\.?\d+(?:e[+-]?\d+)?[df]?\b/i,
  'operator': {
    pattern: /(^|[^.])(?:\+[+=]?|-[-=]?|!=?|<<?=?|>>?>?=?|==?|&[&=]?|\|[|=]?|\*=?|\/=?|%=?|\^=?|[?:~])/m,
    lookbehind: true
  }
});

Prism.languages.insertBefore('java', 'function', {
  'annotation': {
    alias: 'punctuation',
    pattern: /(^|[^.])@\w+/,
    lookbehind: true
  }
});

Prism.languages.json = {
  'property': /"(?:\\.|[^\\"\r\n])*"(?=\s*:)/i,
  'string': {
    pattern: /"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
    greedy: true
  },
  'number': /\b-?(?:0x[\dA-Fa-f]+|\d*\.?\d+(?:[Ee][+-]?\d+)?)\b/,
  'punctuation': /[{}[\]);,]/,
  'operator': /:/g,
  'boolean': /\b(?:true|false)\b/i,
  'null': /\bnull\b/i
};

Prism.languages.jsonp = Prism.languages.json;

(function (Prism) {
  Prism.languages.kotlin = Prism.languages.extend('clike', {
    'keyword': {
      // The lookbehind prevents wrong highlighting of e.g. kotlin.properties.get
      pattern: /(^|[^.])\b(?:abstract|annotation|as|break|by|catch|class|companion|const|constructor|continue|crossinline|data|do|else|enum|final|finally|for|fun|get|if|import|in|init|inline|inner|interface|internal|is|lateinit|noinline|null|object|open|out|override|package|private|protected|public|reified|return|sealed|set|super|tailrec|this|throw|to|try|val|var|when|where|while)\b/,
      lookbehind: true
    },
    'function': [
      /\w+(?=\s*\()/,
      {
        pattern: /(\.)\w+(?=\s*\{)/,
        lookbehind: true
      }
    ],
    'number': /\b(?:0[bx][\da-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?[fFL]?)\b/,
    'operator': /\+[+=]?|-[-=>]?|==?=?|!(?:!|==?)?|[\/*%<>]=?|[?:]:?|\.\.|&&|\|\||\b(?:and|inv|or|shl|shr|ushr|xor)\b/
  });

  delete Prism.languages.kotlin["class-name"];

  Prism.languages.insertBefore('kotlin', 'string', {
    'raw-string': {
      pattern: /("""|''')[\s\S]*?\1/,
      alias: 'string'
      // See interpolation below
    }
  });
  Prism.languages.insertBefore('kotlin', 'keyword', {
    'annotation': {
      pattern: /\B@(?:\w+:)?(?:[A-Z]\w*|\[[^\]]+\])/,
      alias: 'builtin'
    }
  });
  Prism.languages.insertBefore('kotlin', 'function', {
    'label': {
      pattern: /\w+@|@\w+/,
      alias: 'symbol'
    }
  });

  var interpolation = [
    {
      pattern: /\$\{[^}]+\}/,
      inside: {
        delimiter: {
          pattern: /^\$\{|\}$/,
          alias: 'variable'
        },
        rest: Prism.util.clone(Prism.languages.kotlin)
      }
    },
    {
      pattern: /\$\w+/,
      alias: 'variable'
    }
  ];

  Prism.languages.kotlin['string'].inside = Prism.languages.kotlin['raw-string'].inside = {
    interpolation: interpolation
  };

}(Prism));
Prism.languages.markdown = Prism.languages.extend('markup', {});
Prism.languages.insertBefore('markdown', 'prolog', {
  'blockquote': {
    // > ...
    pattern: /^>(?:[\t ]*>)*/m,
    alias: 'punctuation'
  },
  'code': [
    {
      // Prefixed by 4 spaces or 1 tab
      pattern: /^(?: {4}|\t).+/m,
      alias: 'keyword'
    },
    {
      // `code`
      // ``code``
      pattern: /``.+?``|`[^`\n]+`/,
      alias: 'keyword'
    }
  ],
  'title': [
    {
      // title 1
      // =======

      // title 2
      // -------
      pattern: /\w+.*(?:\r?\n|\r)(?:==+|--+)/,
      alias: 'important',
      inside: {
        punctuation: /==+$|--+$/
      }
    },
    {
      // # title 1
      // ###### title 6
      pattern: /(^\s*)#+.+/m,
      lookbehind: true,
      alias: 'important',
      inside: {
        punctuation: /^#+|#+$/
      }
    }
  ],
  'hr': {
    // ***
    // ---
    // * * *
    // -----------
    pattern: /(^\s*)([*-])(?:[\t ]*\2){2,}(?=\s*$)/m,
    lookbehind: true,
    alias: 'punctuation'
  },
  'list': {
    // * item
    // + item
    // - item
    // 1. item
    pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
    lookbehind: true,
    alias: 'punctuation'
  },
  'url-reference': {
    // [id]: http://example.com "Optional title"
    // [id]: http://example.com 'Optional title'
    // [id]: http://example.com (Optional title)
    // [id]: <http://example.com> "Optional title"
    pattern: /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
    inside: {
      'variable': {
        pattern: /^(!?\[)[^\]]+/,
        lookbehind: true
      },
      'string': /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
      'punctuation': /^[\[\]!:]|[<>]/
    },
    alias: 'url'
  },
  'bold': {
    // **strong**
    // __strong__

    // Allow only one line break
    pattern: /(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
    lookbehind: true,
    inside: {
      'punctuation': /^\*\*|^__|\*\*$|__$/
    }
  },
  'italic': {
    // *em*
    // _em_

    // Allow only one line break
    pattern: /(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
    lookbehind: true,
    inside: {
      'punctuation': /^[*_]|[*_]$/
    }
  },
  'url': {
    // [example](http://example.com "Optional title")
    // [example] [id]
    pattern: /!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,
    inside: {
      'variable': {
        pattern: /(!?\[)[^\]]+(?=\]$)/,
        lookbehind: true
      },
      'string': {
        pattern: /"(?:\\.|[^"\\])*"(?=\)$)/
      }
    }
  }
});

Prism.languages.markdown['bold'].inside['url'] = Prism.util.clone(Prism.languages.markdown['url']);
Prism.languages.markdown['italic'].inside['url'] = Prism.util.clone(Prism.languages.markdown['url']);
Prism.languages.markdown['bold'].inside['italic'] = Prism.util.clone(Prism.languages.markdown['italic']);
Prism.languages.markdown['italic'].inside['bold'] = Prism.util.clone(Prism.languages.markdown['bold']);
Prism.languages.powershell = {
  'comment': [
    {
      pattern: /(^|[^`])<#[\s\S]*?#>/,
      lookbehind: true
    },
    {
      pattern: /(^|[^`])#.*/,
      lookbehind: true
    }
  ],
  'string': [
    {
      pattern: /"(?:`[\s\S]|[^`"])*"/,
      greedy: true,
      inside: {
        'function': {
          pattern: /[^`]\$\(.*?\)/,
          // Populated at end of file
          inside: {}
        }
      }
    },
    {
      pattern: /'(?:[^']|'')*'/,
      greedy: true
    }
  ],
  // Matches name spaces as well as casts, attribute decorators. Force starting with letter to avoid matching array indices
  'namespace': /\[[a-z][\s\S]*?\]/i,
  'boolean': /\$(?:true|false)\b/i,
  'variable': /\$\w+\b/i,
  // Cmdlets and aliases. Aliases should come last, otherwise "write" gets preferred over "write-host" for example
  // Get-Command | ?{ $_.ModuleName -match "Microsoft.PowerShell.(Util|Core|Management)" }
  // Get-Alias | ?{ $_.ReferencedCommand.Module.Name -match "Microsoft.PowerShell.(Util|Core|Management)" }
  'function': [
    /\b(?:Add-(?:Computer|Content|History|Member|PSSnapin|Type)|Checkpoint-Computer|Clear-(?:Content|EventLog|History|Item|ItemProperty|Variable)|Compare-Object|Complete-Transaction|Connect-PSSession|ConvertFrom-(?:Csv|Json|StringData)|Convert-Path|ConvertTo-(?:Csv|Html|Json|Xml)|Copy-(?:Item|ItemProperty)|Debug-Process|Disable-(?:ComputerRestore|PSBreakpoint|PSRemoting|PSSessionConfiguration)|Disconnect-PSSession|Enable-(?:ComputerRestore|PSBreakpoint|PSRemoting|PSSessionConfiguration)|Enter-PSSession|Exit-PSSession|Export-(?:Alias|Clixml|Console|Csv|FormatData|ModuleMember|PSSession)|ForEach-Object|Format-(?:Custom|List|Table|Wide)|Get-(?:Alias|ChildItem|Command|ComputerRestorePoint|Content|ControlPanelItem|Culture|Date|Event|EventLog|EventSubscriber|FormatData|Help|History|Host|HotFix|Item|ItemProperty|Job|Location|Member|Module|Process|PSBreakpoint|PSCallStack|PSDrive|PSProvider|PSSession|PSSessionConfiguration|PSSnapin|Random|Service|TraceSource|Transaction|TypeData|UICulture|Unique|Variable|WmiObject)|Group-Object|Import-(?:Alias|Clixml|Csv|LocalizedData|Module|PSSession)|Invoke-(?:Command|Expression|History|Item|RestMethod|WebRequest|WmiMethod)|Join-Path|Limit-EventLog|Measure-(?:Command|Object)|Move-(?:Item|ItemProperty)|New-(?:Alias|Event|EventLog|Item|ItemProperty|Module|ModuleManifest|Object|PSDrive|PSSession|PSSessionConfigurationFile|PSSessionOption|PSTransportOption|Service|TimeSpan|Variable|WebServiceProxy)|Out-(?:Default|File|GridView|Host|Null|Printer|String)|Pop-Location|Push-Location|Read-Host|Receive-(?:Job|PSSession)|Register-(?:EngineEvent|ObjectEvent|PSSessionConfiguration|WmiEvent)|Remove-(?:Computer|Event|EventLog|Item|ItemProperty|Job|Module|PSBreakpoint|PSDrive|PSSession|PSSnapin|TypeData|Variable|WmiObject)|Rename-(?:Computer|Item|ItemProperty)|Reset-ComputerMachinePassword|Resolve-Path|Restart-(?:Computer|Service)|Restore-Computer|Resume-(?:Job|Service)|Save-Help|Select-(?:Object|String|Xml)|Send-MailMessage|Set-(?:Alias|Content|Date|Item|ItemProperty|Location|PSBreakpoint|PSDebug|PSSessionConfiguration|Service|StrictMode|TraceSource|Variable|WmiInstance)|Show-(?:Command|ControlPanelItem|EventLog)|Sort-Object|Split-Path|Start-(?:Job|Process|Service|Sleep|Transaction)|Stop-(?:Computer|Job|Process|Service)|Suspend-(?:Job|Service)|Tee-Object|Test-(?:ComputerSecureChannel|Connection|ModuleManifest|Path|PSSessionConfigurationFile)|Trace-Command|Unblock-File|Undo-Transaction|Unregister-(?:Event|PSSessionConfiguration)|Update-(?:FormatData|Help|List|TypeData)|Use-Transaction|Wait-(?:Event|Job|Process)|Where-Object|Write-(?:Debug|Error|EventLog|Host|Output|Progress|Verbose|Warning))\b/i,
    /\b(?:ac|cat|chdir|clc|cli|clp|clv|compare|copy|cp|cpi|cpp|cvpa|dbp|del|diff|dir|ebp|echo|epal|epcsv|epsn|erase|fc|fl|ft|fw|gal|gbp|gc|gci|gcs|gdr|gi|gl|gm|gp|gps|group|gsv|gu|gv|gwmi|iex|ii|ipal|ipcsv|ipsn|irm|iwmi|iwr|kill|lp|ls|measure|mi|mount|move|mp|mv|nal|ndr|ni|nv|ogv|popd|ps|pushd|pwd|rbp|rd|rdr|ren|ri|rm|rmdir|rni|rnp|rp|rv|rvpa|rwmi|sal|saps|sasv|sbp|sc|select|set|shcm|si|sl|sleep|sls|sort|sp|spps|spsv|start|sv|swmi|tee|trcm|type|write)\b/i
  ],
  // per http://technet.microsoft.com/en-us/library/hh847744.aspx
  'keyword': /\b(?:Begin|Break|Catch|Class|Continue|Data|Define|Do|DynamicParam|Else|ElseIf|End|Exit|Filter|Finally|For|ForEach|From|Function|If|InlineScript|Parallel|Param|Process|Return|Sequence|Switch|Throw|Trap|Try|Until|Using|Var|While|Workflow)\b/i,
  'operator': {
    pattern: /(\W?)(?:!|-(eq|ne|gt|ge|lt|le|sh[lr]|not|b?(?:and|x?or)|(?:Not)?(?:Like|Match|Contains|In)|Replace|Join|is(?:Not)?|as)\b|-[-=]?|\+[+=]?|[*\/%]=?)/i,
    lookbehind: true
  },
  'punctuation': /[|{}[\];(),.]/
};

// Variable interpolation inside strings, and nested expressions
Prism.languages.powershell.string[0].inside.boolean = Prism.languages.powershell.boolean;
Prism.languages.powershell.string[0].inside.variable = Prism.languages.powershell.variable;
Prism.languages.powershell.string[0].inside.function.inside = Prism.util.clone(Prism.languages.powershell);

Prism.languages.properties = {
  'comment': /^[ \t]*[#!].*$/m,
  'attr-value': {
    pattern: /(^[ \t]*(?:\\(?:\r\n|[\s\S])|[^\\\s:=])+?(?: *[=:] *| ))(?:\\(?:\r\n|[\s\S])|[^\\\r\n])+/m,
    lookbehind: true
  },
  'attr-name': /^[ \t]*(?:\\(?:\r\n|[\s\S])|[^\\\s:=])+?(?= *[=:] *| )/m,
  'punctuation': /[=:]/
};
Prism.languages.scala = Prism.languages.extend('java', {
  'keyword': /<-|=>|\b(?:abstract|case|catch|class|def|do|else|extends|final|finally|for|forSome|if|implicit|import|lazy|match|new|null|object|override|package|private|protected|return|sealed|self|super|this|throw|trait|try|type|val|var|while|with|yield)\b/,
  'string': [
    {
      pattern: /"""[\s\S]*?"""/,
      greedy: true
    },
    {
      pattern: /("|')(?:\\.|(?!\1)[^\\\r\n])*\1/,
      greedy: true
    }
  ],
  'builtin': /\b(?:String|Int|Long|Short|Byte|Boolean|Double|Float|Char|Any|AnyRef|AnyVal|Unit|Nothing)\b/,
  'number': /\b(?:0x[\da-f]*\.?[\da-f]+|\d*\.?\d+e?\d*[dfl]?)\b/i,
  'symbol': /'[^\d\s\\]\w*/
});
delete Prism.languages.scala['class-name'];
delete Prism.languages.scala['function'];

Prism.languages.yaml = {
  'scalar': {
    pattern: /([\-:]\s*(?:![^\s]+)?[ \t]*[|>])[ \t]*(?:((?:\r?\n|\r)[ \t]+)[^\r\n]+(?:\2[^\r\n]+)*)/,
    lookbehind: true,
    alias: 'string'
  },
  'comment': /#.*/,
  'key': {
    pattern: /(\s*(?:^|[:\-,[{\r\n?])[ \t]*(?:![^\s]+)?[ \t]*)[^\r\n{[\]},#\s]+?(?=\s*:\s)/,
    lookbehind: true,
    alias: 'atrule'
  },
  'directive': {
    pattern: /(^[ \t]*)%.+/m,
    lookbehind: true,
    alias: 'important'
  },
  'datetime': {
    pattern: /([:\-,[{]\s*(?:![^\s]+)?[ \t]*)(?:\d{4}-\d\d?-\d\d?(?:[tT]|[ \t]+)\d\d?:\d{2}:\d{2}(?:\.\d*)?[ \t]*(?:Z|[-+]\d\d?(?::\d{2})?)?|\d{4}-\d{2}-\d{2}|\d\d?:\d{2}(?::\d{2}(?:\.\d*)?)?)(?=[ \t]*(?:$|,|]|}))/m,
    lookbehind: true,
    alias: 'number'
  },
  'boolean': {
    pattern: /([:\-,[{]\s*(?:![^\s]+)?[ \t]*)(?:true|false)[ \t]*(?=$|,|]|})/im,
    lookbehind: true,
    alias: 'important'
  },
  'null': {
    pattern: /([:\-,[{]\s*(?:![^\s]+)?[ \t]*)(?:null|~)[ \t]*(?=$|,|]|})/im,
    lookbehind: true,
    alias: 'important'
  },
  'string': {
    pattern: /([:\-,[{]\s*(?:![^\s]+)?[ \t]*)("|')(?:(?!\2)[^\\\r\n]|\\.)*\2(?=[ \t]*(?:$|,|]|}))/m,
    lookbehind: true,
    greedy: true
  },
  'number': {
    pattern: /([:\-,[{]\s*(?:![^\s]+)?[ \t]*)[+\-]?(?:0x[\da-f]+|0o[0-7]+|(?:\d+\.?\d*|\.?\d+)(?:e[+-]?\d+)?|\.inf|\.nan)[ \t]*(?=$|,|]|})/im,
    lookbehind: true
  },
  'tag': /![^\s]+/,
  'important': /[&*][\w]+/,
  'punctuation': /---|[:[\]{}\-,|>?]|\.\.\./
};

(function () {

  if (typeof self === 'undefined' || !self.Prism || !self.document || !document.querySelector) {
    return;
  }

  function $$(expr, con) {
    return Array.prototype.slice.call((con || document).querySelectorAll(expr));
  }

  function hasClass(element, className) {
    className = " " + className + " ";
    return (" " + element.className + " ").replace(/[\n\t]/g, " ").indexOf(className) > -1
  }

// Some browsers round the line-height, others don't.
// We need to test for it to position the elements properly.
  var isLineHeightRounded = (function () {
    var res;
    return function () {
      if (typeof res === 'undefined') {
        var d = document.createElement('div');
        d.style.fontSize = '13px';
        d.style.lineHeight = '1.5';
        d.style.padding = 0;
        d.style.border = 0;
        d.innerHTML = '&nbsp;<br />&nbsp;';
        document.body.appendChild(d);
        // Browsers that round the line-height should have offsetHeight === 38
        // The others should have 39.
        res = d.offsetHeight === 38;
        document.body.removeChild(d);
      }
      return res;
    }
  }());

  function highlightLines(pre, lines, classes) {
    var ranges = lines.replace(/\s+/g, '').split(','),
      offset = +pre.getAttribute('data-line-offset') || 0;

    var parseMethod = isLineHeightRounded() ? parseInt : parseFloat;
    var lineHeight = parseMethod(getComputedStyle(pre).lineHeight);

    for (var i = 0, range; range = ranges[i++];) {
      range = range.split('-');

      var start = +range[0],
        end = +range[1] || start;

      var line = document.createElement('div');

      line.textContent = Array(end - start + 2).join(' \n');
      line.setAttribute('aria-hidden', 'true');
      line.className = (classes || '') + ' line-highlight';

      //if the line-numbers plugin is enabled, then there is no reason for this plugin to display the line numbers
      if (!hasClass(pre, 'line-numbers')) {
        line.setAttribute('data-start', start);

        if (end > start) {
          line.setAttribute('data-end', end);
        }
      }

      line.style.top = (start - offset - 1) * lineHeight + 'px';

      //allow this to play nicely with the line-numbers plugin
      if (hasClass(pre, 'line-numbers')) {
        //need to attack to pre as when line-numbers is enabled, the code tag is relatively which screws up the positioning
        pre.appendChild(line);
      } else {
        (pre.querySelector('code') || pre).appendChild(line);
      }
    }
  }

  function applyHash() {
    var hash = location.hash.slice(1);

    // Remove pre-existing temporary lines
    $$('.temporary.line-highlight').forEach(function (line) {
      line.parentNode.removeChild(line);
    });

    var range = (hash.match(/\.([\d,-]+)$/) || [, ''])[1];

    if (!range || document.getElementById(hash)) {
      return;
    }

    var id = hash.slice(0, hash.lastIndexOf('.')),
      pre = document.getElementById(id);

    if (!pre) {
      return;
    }

    if (!pre.hasAttribute('data-line')) {
      pre.setAttribute('data-line', '');
    }

    highlightLines(pre, range, 'temporary ');

    document.querySelector('.temporary.line-highlight').scrollIntoView();
  }

  var fakeTimer = 0; // Hack to limit the number of times applyHash() runs

  Prism.hooks.add('before-sanity-check', function (env) {
    var pre = env.element.parentNode;
    var lines = pre && pre.getAttribute('data-line');

    if (!pre || !lines || !/pre/i.test(pre.nodeName)) {
      return;
    }

    /*
      * Cleanup for other plugins (e.g. autoloader).
       *
       * Sometimes <code> blocks are highlighted multiple times. It is necessary
       * to cleanup any left-over tags, because the whitespace inside of the <div>
       * tags change the content of the <code> tag.
       */
    var num = 0;
    $$('.line-highlight', pre).forEach(function (line) {
      num += line.textContent.length;
      line.parentNode.removeChild(line);
    });
    // Remove extra whitespace
    if (num && /^( \n)+$/.test(env.code.slice(-num))) {
      env.code = env.code.slice(0, -num);
    }
  });

  Prism.hooks.add('complete', function (env) {
    var pre = env.element.parentNode;
    var lines = pre && pre.getAttribute('data-line');

    if (!pre || !lines || !/pre/i.test(pre.nodeName)) {
      return;
    }

    clearTimeout(fakeTimer);
    highlightLines(pre, lines);

    fakeTimer = setTimeout(applyHash, 1);
  });

  window.addEventListener('hashchange', applyHash);

})();

(function () {

  if (typeof self === 'undefined' || !self.Prism || !self.document) {
    return;
  }

  /**
   * Class name for <pre> which is activating the plugin
   * @type {String}
   */
  var PLUGIN_CLASS = 'line-numbers';

  /**
   * Resizes line numbers spans according to height of line of code
   * @param  {Element} element <pre> element
   */
  var _resizeElement = function (element) {
    var codeStyles = getStyles(element);
    var whiteSpace = codeStyles['white-space'];

    if (whiteSpace === 'pre-wrap' || whiteSpace === 'pre-line') {
      var codeElement = element.querySelector('code');
      var lineNumbersWrapper = element.querySelector('.line-numbers-rows');
      var lineNumberSizer = element.querySelector('.line-numbers-sizer');
      var codeLines = element.textContent.split('\n');

      if (!lineNumberSizer) {
        lineNumberSizer = document.createElement('span');
        lineNumberSizer.className = 'line-numbers-sizer';

        codeElement.appendChild(lineNumberSizer);
      }

      lineNumberSizer.style.display = 'block';

      codeLines.forEach(function (line, lineNumber) {
        lineNumberSizer.textContent = line || '\n';
        var lineSize = lineNumberSizer.getBoundingClientRect().height;
        lineNumbersWrapper.children[lineNumber].style.height = lineSize + 'px';
      });

      lineNumberSizer.textContent = '';
      lineNumberSizer.style.display = 'none';
    }
  };

  /**
   * Returns style declarations for the element
   * @param {Element} element
   */
  var getStyles = function (element) {
    if (!element) {
      return null;
    }

    return window.getComputedStyle ? getComputedStyle(element) : (element.currentStyle || null);
  };

  window.addEventListener('resize', function () {
    Array.prototype.forEach.call(document.querySelectorAll('pre.' + PLUGIN_CLASS), _resizeElement);
  });

  Prism.hooks.add('complete', function (env) {
    if (!env.code) {
      return;
    }

    // works only for <code> wrapped inside <pre> (not inline)
    var pre = env.element.parentNode;
    var clsReg = /\s*\bline-numbers\b\s*/;
    if (
      !pre || !/pre/i.test(pre.nodeName) ||
      // Abort only if nor the <pre> nor the <code> have the class
      (!clsReg.test(pre.className) && !clsReg.test(env.element.className))
    ) {
      return;
    }

    if (env.element.querySelector(".line-numbers-rows")) {
      // Abort if line numbers already exists
      return;
    }

    if (clsReg.test(env.element.className)) {
      // Remove the class "line-numbers" from the <code>
      env.element.className = env.element.className.replace(clsReg, ' ');
    }
    if (!clsReg.test(pre.className)) {
      // Add the class "line-numbers" to the <pre>
      pre.className += ' line-numbers';
    }

    var match = env.code.match(/\n(?!$)/g);
    var linesNum = match ? match.length + 1 : 1;
    var lineNumbersWrapper;

    var lines = new Array(linesNum + 1);
    lines = lines.join('<span></span>');

    lineNumbersWrapper = document.createElement('span');
    lineNumbersWrapper.setAttribute('aria-hidden', 'true');
    lineNumbersWrapper.className = 'line-numbers-rows';
    lineNumbersWrapper.innerHTML = lines;

    if (pre.hasAttribute('data-start')) {
      pre.style.counterReset = 'linenumber ' + (parseInt(pre.getAttribute('data-start'), 10) - 1);
    }

    env.element.appendChild(lineNumbersWrapper);

    _resizeElement(pre);
  });

}());
(function () {
  if (typeof self === 'undefined' || !self.Prism || !self.document || !document.querySelector) {
    return;
  }

  self.Prism.fileHighlight = function () {

    var Extensions = {
      'js': 'javascript',
      'py': 'python',
      'rb': 'ruby',
      'ps1': 'powershell',
      'psm1': 'powershell',
      'sh': 'bash',
      'bat': 'batch',
      'h': 'c',
      'tex': 'latex'
    };

    Array.prototype.slice.call(document.querySelectorAll('pre[data-src]')).forEach(function (pre) {
      var src = pre.getAttribute('data-src');

      var language, parent = pre;
      var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;
      while (parent && !lang.test(parent.className)) {
        parent = parent.parentNode;
      }

      if (parent) {
        language = (pre.className.match(lang) || [, ''])[1];
      }

      if (!language) {
        var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
        language = Extensions[extension] || extension;
      }

      var code = document.createElement('code');
      code.className = 'language-' + language;

      pre.textContent = '';

      code.textContent = 'Loading…';

      pre.appendChild(code);

      var xhr = new XMLHttpRequest();

      xhr.open('GET', src, true);

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {

          if (xhr.status < 400 && xhr.responseText) {
            code.textContent = xhr.responseText;

            Prism.highlightElement(code);
          }
          else if (xhr.status >= 400) {
            code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
          }
          else {
            code.textContent = '✖ Error: File does not exist or is empty';
          }
        }
      };

      xhr.send(null);
    });

  };

  document.addEventListener('DOMContentLoaded', self.Prism.fileHighlight);

})();

(function () {
  if (typeof self === 'undefined' || !self.Prism || !self.document) {
    return;
  }

  var callbacks = [];
  var map = {};
  var noop = function () {
  };

  Prism.plugins.toolbar = {};

  /**
   * Register a button callback with the toolbar.
   *
   * @param {string} key
   * @param {Object|Function} opts
   */
  var registerButton = Prism.plugins.toolbar.registerButton = function (key, opts) {
    var callback;

    if (typeof opts === 'function') {
      callback = opts;
    } else {
      callback = function (env) {
        var element;

        if (typeof opts.onClick === 'function') {
          element = document.createElement('button');
          element.type = 'button';
          element.addEventListener('click', function () {
            opts.onClick.call(this, env);
          });
        } else if (typeof opts.url === 'string') {
          element = document.createElement('a');
          element.href = opts.url;
        } else {
          element = document.createElement('span');
        }

        element.textContent = opts.text;

        return element;
      };
    }

    callbacks.push(map[key] = callback);
  };

  /**
   * Post-highlight Prism hook callback.
   *
   * @param env
   */
  var hook = Prism.plugins.toolbar.hook = function (env) {
    // Check if inline or actual code block (credit to line-numbers plugin)
    var pre = env.element.parentNode;
    if (!pre || !/pre/i.test(pre.nodeName)) {
      return;
    }

    // Autoloader rehighlights, so only do this once.
    if (pre.classList.contains('code-toolbar')) {
      return;
    }

    pre.classList.add('code-toolbar');

    // Setup the toolbar
    var toolbar = document.createElement('div');
    toolbar.classList.add('toolbar');

    if (document.body.hasAttribute('data-toolbar-order')) {
      callbacks = document.body.getAttribute('data-toolbar-order').split(',').map(function (key) {
        return map[key] || noop;
      });
    }

    callbacks.forEach(function (callback) {
      var element = callback(env);

      if (!element) {
        return;
      }

      var item = document.createElement('div');
      item.classList.add('toolbar-item');

      item.appendChild(element);
      toolbar.appendChild(item);
    });

    // Add our toolbar to the <pre> tag
    pre.appendChild(toolbar);
  };

  registerButton('label', function (env) {
    var pre = env.element.parentNode;
    if (!pre || !/pre/i.test(pre.nodeName)) {
      return;
    }

    if (!pre.hasAttribute('data-label')) {
      return;
    }

    var element, template;
    var text = pre.getAttribute('data-label');
    try {
      // Any normal text will blow up this selector.
      template = document.querySelector('template#' + text);
    } catch (e) {
    }

    if (template) {
      element = template.content;
    } else {
      if (pre.hasAttribute('data-url')) {
        element = document.createElement('a');
        element.href = pre.getAttribute('data-url');
      } else {
        element = document.createElement('span');
      }

      element.textContent = text;
    }

    return element;
  });

  /**
   * Register the toolbar with Prism.
   */
  Prism.hooks.add('complete', hook);
})();

(function () {
  if (!self.Prism || !self.document || !document.querySelectorAll || ![].filter) return;

  var adapters = [];

  function registerAdapter(adapter) {
    if (typeof adapter === "function" && !getAdapter(adapter)) {
      adapters.push(adapter);
    }
  }

  function getAdapter(adapter) {
    if (typeof adapter === "function") {
      return adapters.filter(function (fn) {
        return fn.valueOf() === adapter.valueOf()
      })[0];
    }
    else if (typeof adapter === "string" && adapter.length > 0) {
      return adapters.filter(function (fn) {
        return fn.name === adapter
      })[0];
    }
    return null;
  }

  function removeAdapter(adapter) {
    if (typeof adapter === "string")
      adapter = getAdapter(adapter);
    if (typeof adapter === "function") {
      var index = adapters.indexOf(adapter);
      if (index >= 0) {
        adapters.splice(index, 1);
      }
    }
  }

  Prism.plugins.jsonphighlight = {
    registerAdapter: registerAdapter,
    removeAdapter: removeAdapter,
    highlight: highlight
  };
  registerAdapter(function github(rsp, el) {
    if (rsp && rsp.meta && rsp.data) {
      if (rsp.meta.status && rsp.meta.status >= 400) {
        return "Error: " + ( rsp.data.message || rsp.meta.status );
      }
      else if (typeof(rsp.data.content) === "string") {
        return typeof(atob) === "function"
          ? atob(rsp.data.content.replace(/\s/g, ""))
          : "Your browser cannot decode base64";
      }
    }
    return null;
  });
  registerAdapter(function gist(rsp, el) {
    if (rsp && rsp.meta && rsp.data && rsp.data.files) {
      if (rsp.meta.status && rsp.meta.status >= 400) {
        return "Error: " + ( rsp.data.message || rsp.meta.status );
      }
      else {
        var filename = el.getAttribute("data-filename");
        if (filename == null) {
          // Maybe in the future we can somehow render all files
          // But the standard <script> include for gists does that nicely already,
          // so that might be getting beyond the scope of this plugin
          for (var key in rsp.data.files) {
            if (rsp.data.files.hasOwnProperty(key)) {
              filename = key;
              break;
            }
          }
        }
        if (rsp.data.files[filename] !== undefined) {
          return rsp.data.files[filename].content;
        }
        else {
          return "Error: unknown or missing gist file " + filename;
        }
      }
    }
    return null;
  });
  registerAdapter(function bitbucket(rsp, el) {
    return rsp && rsp.node && typeof(rsp.data) === "string"
      ? rsp.data
      : null;
  });

  var jsonpcb = 0,
    loadstr = "Loading…";

  function highlight() {
    Array.prototype.slice.call(document.querySelectorAll("pre[data-jsonp]")).forEach(function (pre) {
      pre.textContent = "";

      var code = document.createElement("code");
      code.textContent = loadstr;
      pre.appendChild(code);

      var adapterfn = pre.getAttribute("data-adapter");
      var adapter = null;
      if (adapterfn) {
        if (typeof(window[adapterfn]) === "function") {
          adapter = window[adapterfn];
        }
        else {
          code.textContent = "JSONP adapter function '" + adapterfn + "' doesn't exist";
          return;
        }
      }

      var cb = "prismjsonp" + ( jsonpcb++ );

      var uri = document.createElement("a");
      var src = uri.href = pre.getAttribute("data-jsonp");
      uri.href += ( uri.search ? "&" : "?" ) + ( pre.getAttribute("data-callback") || "callback" ) + "=" + cb;

      var timeout = setTimeout(function () {
        // we could clean up window[cb], but if the request finally succeeds, keeping it around is a good thing
        if (code.textContent === loadstr)
          code.textContent = "Timeout loading '" + src + "'";
      }, 5000);

      var script = document.createElement("script");
      script.src = uri.href;

      window[cb] = function (rsp) {
        document.head.removeChild(script);
        clearTimeout(timeout);
        delete window[cb];

        var data = "";

        if (adapter) {
          data = adapter(rsp, pre);
        }
        else {
          for (var p in adapters) {
            data = adapters[p](rsp, pre);
            if (data !== null) break;
          }
        }

        if (data === null) {
          code.textContent = "Cannot parse response (perhaps you need an adapter function?)";
        }
        else {
          code.textContent = data;
          Prism.highlightElement(code);
        }
      };

      document.head.appendChild(script);
    });
  }

  highlight();
})();
(function () {

  if (
    typeof self !== 'undefined' && !self.Prism ||
    typeof global !== 'undefined' && !global.Prism
  ) {
    return;
  }

  Prism.hooks.add('wrap', function (env) {
    if (env.type !== "keyword") {
      return;
    }
    env.classes.push('keyword-' + env.content);
  });

})();

(function () {

  if (typeof self === 'undefined' || !self.Prism || !self.document || !Function.prototype.bind) {
    return;
  }

  /**
   * Returns the absolute X, Y offsets for an element
   * @param {HTMLElement} element
   * @returns {{top: number, right: number, bottom: number, left: number}}
   */
  var getOffset = function (element) {
    var left = 0, top = 0, el = element;

    if (el.parentNode) {
      do {
        left += el.offsetLeft;
        top += el.offsetTop;
      } while ((el = el.offsetParent) && el.nodeType < 9);

      el = element;

      do {
        left -= el.scrollLeft;
        top -= el.scrollTop;
      } while ((el = el.parentNode) && !/body/i.test(el.nodeName));
    }

    return {
      top: top,
      right: innerWidth - left - element.offsetWidth,
      bottom: innerHeight - top - element.offsetHeight,
      left: left
    };
  };

  var tokenRegexp = /(?:^|\s)token(?=$|\s)/;
  var activeRegexp = /(?:^|\s)active(?=$|\s)/g;
  var flippedRegexp = /(?:^|\s)flipped(?=$|\s)/g;

  /**
   * Previewer constructor
   * @param {string} type Unique previewer type
   * @param {function} updater Function that will be called on mouseover.
   * @param {string[]|string=} supportedLanguages Aliases of the languages this previewer must be enabled for. Defaults to "*", all languages.
   * @constructor
   */
  var Previewer = function (type, updater, supportedLanguages, initializer) {
    this._elt = null;
    this._type = type;
    this._clsRegexp = RegExp('(?:^|\\s)' + type + '(?=$|\\s)');
    this._token = null;
    this.updater = updater;
    this._mouseout = this.mouseout.bind(this);
    this.initializer = initializer;

    var self = this;

    if (!supportedLanguages) {
      supportedLanguages = ['*'];
    }
    if (Prism.util.type(supportedLanguages) !== 'Array') {
      supportedLanguages = [supportedLanguages];
    }
    supportedLanguages.forEach(function (lang) {
      if (typeof lang !== 'string') {
        lang = lang.lang;
      }
      if (!Previewer.byLanguages[lang]) {
        Previewer.byLanguages[lang] = [];
      }
      if (Previewer.byLanguages[lang].indexOf(self) < 0) {
        Previewer.byLanguages[lang].push(self);
      }
    });
    Previewer.byType[type] = this;
  };

  /**
   * Creates the HTML element for the previewer.
   */
  Previewer.prototype.init = function () {
    if (this._elt) {
      return;
    }
    this._elt = document.createElement('div');
    this._elt.className = 'prism-previewer prism-previewer-' + this._type;
    document.body.appendChild(this._elt);
    if (this.initializer) {
      this.initializer();
    }
  };

  /**
   * Checks the class name of each hovered element
   * @param token
   */
  Previewer.prototype.check = function (token) {
    do {
      if (tokenRegexp.test(token.className) && this._clsRegexp.test(token.className)) {
        break;
      }
    } while (token = token.parentNode);

    if (token && token !== this._token) {
      this._token = token;
      this.show();
    }
  };

  /**
   * Called on mouseout
   */
  Previewer.prototype.mouseout = function () {
    this._token.removeEventListener('mouseout', this._mouseout, false);
    this._token = null;
    this.hide();
  };

  /**
   * Shows the previewer positioned properly for the current token.
   */
  Previewer.prototype.show = function () {
    if (!this._elt) {
      this.init();
    }
    if (!this._token) {
      return;
    }

    if (this.updater.call(this._elt, this._token.textContent)) {
      this._token.addEventListener('mouseout', this._mouseout, false);

      var offset = getOffset(this._token);
      this._elt.className += ' active';

      if (offset.top - this._elt.offsetHeight > 0) {
        this._elt.className = this._elt.className.replace(flippedRegexp, '');
        this._elt.style.top = offset.top + 'px';
        this._elt.style.bottom = '';
      } else {
        this._elt.className += ' flipped';
        this._elt.style.bottom = offset.bottom + 'px';
        this._elt.style.top = '';
      }

      this._elt.style.left = offset.left + Math.min(200, this._token.offsetWidth / 2) + 'px';
    } else {
      this.hide();
    }
  };

  /**
   * Hides the previewer.
   */
  Previewer.prototype.hide = function () {
    this._elt.className = this._elt.className.replace(activeRegexp, '');
  };

  /**
   * Map of all registered previewers by language
   * @type {{}}
   */
  Previewer.byLanguages = {};

  /**
   * Map of all registered previewers by type
   * @type {{}}
   */
  Previewer.byType = {};

  /**
   * Initializes the mouseover event on the code block.
   * @param {HTMLElement} elt The code block (env.element)
   * @param {string} lang The language (env.language)
   */
  Previewer.initEvents = function (elt, lang) {
    var previewers = [];
    if (Previewer.byLanguages[lang]) {
      previewers = previewers.concat(Previewer.byLanguages[lang]);
    }
    if (Previewer.byLanguages['*']) {
      previewers = previewers.concat(Previewer.byLanguages['*']);
    }
    elt.addEventListener('mouseover', function (e) {
      var target = e.target;
      previewers.forEach(function (previewer) {
        previewer.check(target);
      });
    }, false);
  };
  Prism.plugins.Previewer = Previewer;

  // Initialize the previewers only when needed
  Prism.hooks.add('after-highlight', function (env) {
    if (Previewer.byLanguages['*'] || Previewer.byLanguages[env.language]) {
      Previewer.initEvents(env.element, env.language);
    }
  });

}());
(function () {

  var assign = Object.assign || function (obj1, obj2) {
    for (var name in obj2) {
      if (obj2.hasOwnProperty(name))
        obj1[name] = obj2[name];
    }
    return obj1;
  }

  function NormalizeWhitespace(defaults) {
    this.defaults = assign({}, defaults);
  }

  function toCamelCase(value) {
    return value.replace(/-(\w)/g, function (match, firstChar) {
      return firstChar.toUpperCase();
    });
  }

  function tabLen(str) {
    var res = 0;
    for (var i = 0; i < str.length; ++i) {
      if (str.charCodeAt(i) == '\t'.charCodeAt(0))
        res += 3;
    }
    return str.length + res;
  }

  NormalizeWhitespace.prototype = {
    setDefaults: function (defaults) {
      this.defaults = assign(this.defaults, defaults);
    },
    normalize: function (input, settings) {
      settings = assign(this.defaults, settings);

      for (var name in settings) {
        var methodName = toCamelCase(name);
        if (name !== "normalize" && methodName !== 'setDefaults' &&
          settings[name] && this[methodName]) {
          input = this[methodName].call(this, input, settings[name]);
        }
      }

      return input;
    },

    /*
       * Normalization methods
       */
    leftTrim: function (input) {
      return input.replace(/^\s+/, '');
    },
    rightTrim: function (input) {
      return input.replace(/\s+$/, '');
    },
    tabsToSpaces: function (input, spaces) {
      spaces = spaces | 0 || 4;
      return input.replace(/\t/g, new Array(++spaces).join(' '));
    },
    spacesToTabs: function (input, spaces) {
      spaces = spaces | 0 || 4;
      return input.replace(new RegExp(' {' + spaces + '}', 'g'), '\t');
    },
    removeTrailing: function (input) {
      return input.replace(/\s*?$/gm, '');
    },
    // Support for deprecated plugin remove-initial-line-feed
    removeInitialLineFeed: function (input) {
      return input.replace(/^(?:\r?\n|\r)/, '');
    },
    removeIndent: function (input) {
      var indents = input.match(/^[^\S\n\r]*(?=\S)/gm);

      if (!indents || !indents[0].length)
        return input;

      indents.sort(function (a, b) {
        return a.length - b.length;
      });

      if (!indents[0].length)
        return input;

      return input.replace(new RegExp('^' + indents[0], 'gm'), '');
    },
    indent: function (input, tabs) {
      return input.replace(/^[^\S\n\r]*(?=\S)/gm, new Array(++tabs).join('\t') + '$&');
    },
    breakLines: function (input, characters) {
      characters = (characters === true) ? 80 : characters | 0 || 80;

      var lines = input.split('\n');
      for (var i = 0; i < lines.length; ++i) {
        if (tabLen(lines[i]) <= characters)
          continue;

        var line = lines[i].split(/(\s+)/g),
          len = 0;

        for (var j = 0; j < line.length; ++j) {
          var tl = tabLen(line[j]);
          len += tl;
          if (len > characters) {
            line[j] = '\n' + line[j];
            len = tl;
          }
        }
        lines[i] = line.join('');
      }
      return lines.join('\n');
    }
  };

// Support node modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NormalizeWhitespace;
  }

// Exit if prism is not loaded
  if (typeof Prism === 'undefined') {
    return;
  }

  Prism.plugins.NormalizeWhitespace = new NormalizeWhitespace({
    'remove-trailing': true,
    'remove-indent': true,
    'left-trim': true,
    'right-trim': true,
    /*'break-lines': 80,
      'indent': 2,
      'remove-initial-line-feed': false,
      'tabs-to-spaces': 4,
      'spaces-to-tabs': 4*/
  });

  Prism.hooks.add('before-sanity-check', function (env) {
    var Normalizer = Prism.plugins.NormalizeWhitespace;

    // Check settings
    if (env.settings && env.settings['whitespace-normalization'] === false) {
      return;
    }

    // Simple mode if there is no env.element
    if ((!env.element || !env.element.parentNode) && env.code) {
      env.code = Normalizer.normalize(env.code, env.settings);
      return;
    }

    // Normal mode
    var pre = env.element.parentNode;
    var clsReg = /\bno-whitespace-normalization\b/;
    if (!env.code || !pre || pre.nodeName.toLowerCase() !== 'pre' ||
      clsReg.test(pre.className) || clsReg.test(env.element.className))
      return;

    var children = pre.childNodes,
      before = '',
      after = '',
      codeFound = false;

    // Move surrounding whitespace from the <pre> tag into the <code> tag
    for (var i = 0; i < children.length; ++i) {
      var node = children[i];

      if (node == env.element) {
        codeFound = true;
      } else if (node.nodeName === "#text") {
        if (codeFound) {
          after += node.nodeValue;
        } else {
          before += node.nodeValue;
        }

        pre.removeChild(node);
        --i;
      }
    }

    if (!env.element.children.length || !Prism.plugins.KeepMarkup) {
      env.code = before + env.code + after;
      env.code = Normalizer.normalize(env.code, env.settings);
    } else {
      // Preserve markup for keep-markup plugin
      var html = before + env.element.innerHTML + after;
      env.element.innerHTML = Normalizer.normalize(html, env.settings);
      env.code = env.element.textContent;
    }
  });

}());
(function () {

  if (typeof self === 'undefined' || !self.Prism || !self.document || !document.createRange) {
    return;
  }

  Prism.plugins.KeepMarkup = true;

  Prism.hooks.add('before-highlight', function (env) {
    if (!env.element.children.length) {
      return;
    }

    var pos = 0;
    var data = [];
    var f = function (elt, baseNode) {
      var o = {};
      if (!baseNode) {
        // Clone the original tag to keep all attributes
        o.clone = elt.cloneNode(false);
        o.posOpen = pos;
        data.push(o);
      }
      for (var i = 0, l = elt.childNodes.length; i < l; i++) {
        var child = elt.childNodes[i];
        if (child.nodeType === 1) { // element
          f(child);
        } else if (child.nodeType === 3) { // text
          pos += child.data.length;
        }
      }
      if (!baseNode) {
        o.posClose = pos;
      }
    };
    f(env.element, true);

    if (data && data.length) {
      // data is an array of all existing tags
      env.keepMarkup = data;
    }
  });

  Prism.hooks.add('after-highlight', function (env) {
    if (env.keepMarkup && env.keepMarkup.length) {

      var walk = function (elt, nodeState) {
        for (var i = 0, l = elt.childNodes.length; i < l; i++) {

          var child = elt.childNodes[i];

          if (child.nodeType === 1) { // element
            if (!walk(child, nodeState)) {
              return false;
            }

          } else if (child.nodeType === 3) { // text
            if (!nodeState.nodeStart && nodeState.pos + child.data.length > nodeState.node.posOpen) {
              // We found the start position
              nodeState.nodeStart = child;
              nodeState.nodeStartPos = nodeState.node.posOpen - nodeState.pos;
            }
            if (nodeState.nodeStart && nodeState.pos + child.data.length >= nodeState.node.posClose) {
              // We found the end position
              nodeState.nodeEnd = child;
              nodeState.nodeEndPos = nodeState.node.posClose - nodeState.pos;
            }

            nodeState.pos += child.data.length;
          }

          if (nodeState.nodeStart && nodeState.nodeEnd) {
            // Select the range and wrap it with the clone
            var range = document.createRange();
            range.setStart(nodeState.nodeStart, nodeState.nodeStartPos);
            range.setEnd(nodeState.nodeEnd, nodeState.nodeEndPos);
            nodeState.node.clone.appendChild(range.extractContents());
            range.insertNode(nodeState.node.clone);
            range.detach();

            // Process is over
            return false;
          }
        }
        return true;
      };

      // For each tag, we walk the DOM to reinsert it
      env.keepMarkup.forEach(function (node) {
        walk(env.element, {
          node: node,
          pos: 0
        });
      });
      // Store new highlightedCode for later hooks calls
      env.highlightedCode = env.element.innerHTML;
    }
  });
}());

(function () {

  if (
    typeof self !== 'undefined' && !self.Prism ||
    typeof global !== 'undefined' && !global.Prism
  ) {
    return;
  }

  var autoLinkerProcess = function (grammar) {
    if (Prism.plugins.autolinker) {
      Prism.plugins.autolinker.processGrammar(grammar);
    }
    return grammar;
  };
  var dataURI = {
    pattern: /(.)\bdata:[^\/]+\/[^,]+,(?:(?!\1)[\s\S]|\\\1)+(?=\1)/,
    lookbehind: true,
    inside: {
      'language-css': {
        pattern: /(data:[^\/]+\/(?:[^+,]+\+)?css,)[\s\S]+/,
        lookbehind: true
      },
      'language-javascript': {
        pattern: /(data:[^\/]+\/(?:[^+,]+\+)?javascript,)[\s\S]+/,
        lookbehind: true
      },
      'language-json': {
        pattern: /(data:[^\/]+\/(?:[^+,]+\+)?json,)[\s\S]+/,
        lookbehind: true
      },
      'language-markup': {
        pattern: /(data:[^\/]+\/(?:[^+,]+\+)?(?:html|xml),)[\s\S]+/,
        lookbehind: true
      }
    }
  };

  // Tokens that may contain URLs
  var candidates = ['url', 'attr-value', 'string'];

  Prism.plugins.dataURIHighlight = {
    processGrammar: function (grammar) {
      // Abort if grammar has already been processed
      if (!grammar || grammar['data-uri']) {
        return;
      }

      Prism.languages.DFS(grammar, function (key, def, type) {
        if (candidates.indexOf(type) > -1 && Prism.util.type(def) !== 'Array') {
          if (!def.pattern) {
            def = this[key] = {
              pattern: def
            };
          }

          def.inside = def.inside || {};

          if (type == 'attr-value') {
            Prism.languages.insertBefore('inside', def.inside['url-link'] ? 'url-link' : 'punctuation', {
              'data-uri': dataURI
            }, def);
          }
          else {
            if (def.inside['url-link']) {
              Prism.languages.insertBefore('inside', 'url-link', {
                'data-uri': dataURI
              }, def);
            } else {
              def.inside['data-uri'] = dataURI;
            }
          }
        }
      });
      grammar['data-uri'] = dataURI;
    }
  };

  Prism.hooks.add('before-highlight', function (env) {
    // Prepare the needed grammars for this code block
    if (dataURI.pattern.test(env.code)) {
      for (var p in dataURI.inside) {
        if (dataURI.inside.hasOwnProperty(p)) {
          if (!dataURI.inside[p].inside && dataURI.inside[p].pattern.test(env.code)) {
            var lang = p.match(/^language-(.+)/)[1];
            if (Prism.languages[lang]) {
              dataURI.inside[p].inside = {
                rest: autoLinkerProcess(Prism.languages[lang])
              };
            }
          }
        }
      }
    }

    Prism.plugins.dataURIHighlight.processGrammar(env.grammar);
  });
}());
(function () {

  if (typeof self === 'undefined' || !self.Prism || !self.document) {
    return;
  }

  if (!Prism.plugins.toolbar) {
    console.warn('Show Languages plugin loaded before Toolbar plugin.');

    return;
  }

// The languages map is built automatically with gulp
  var Languages = /*languages_placeholder[*/{
    "html": "HTML",
    "xml": "XML",
    "svg": "SVG",
    "mathml": "MathML",
    "css": "CSS",
    "clike": "C-like",
    "javascript": "JavaScript",
    "abap": "ABAP",
    "actionscript": "ActionScript",
    "apacheconf": "Apache Configuration",
    "apl": "APL",
    "applescript": "AppleScript",
    "asciidoc": "AsciiDoc",
    "aspnet": "ASP.NET (C#)",
    "autoit": "AutoIt",
    "autohotkey": "AutoHotkey",
    "basic": "BASIC",
    "csharp": "C#",
    "cpp": "C++",
    "coffeescript": "CoffeeScript",
    "css-extras": "CSS Extras",
    "django": "Django/Jinja2",
    "fsharp": "F#",
    "glsl": "GLSL",
    "graphql": "GraphQL",
    "http": "HTTP",
    "inform7": "Inform 7",
    "json": "JSON",
    "latex": "LaTeX",
    "livescript": "LiveScript",
    "lolcode": "LOLCODE",
    "matlab": "MATLAB",
    "mel": "MEL",
    "n4js": "N4JS",
    "nasm": "NASM",
    "nginx": "nginx",
    "nsis": "NSIS",
    "objectivec": "Objective-C",
    "ocaml": "OCaml",
    "opencl": "OpenCL",
    "parigp": "PARI/GP",
    "php": "PHP",
    "php-extras": "PHP Extras",
    "powershell": "PowerShell",
    "properties": ".properties",
    "protobuf": "Protocol Buffers",
    "jsx": "React JSX",
    "renpy": "Ren'py",
    "rest": "reST (reStructuredText)",
    "sas": "SAS",
    "sass": "Sass (Sass)",
    "scss": "Sass (Scss)",
    "sql": "SQL",
    "typescript": "TypeScript",
    "vbnet": "VB.Net",
    "vhdl": "VHDL",
    "vim": "vim",
    "wiki": "Wiki markup",
    "xojo": "Xojo (REALbasic)",
    "yaml": "YAML"
  }/*]*/;
  Prism.plugins.toolbar.registerButton('show-language', function (env) {
    var pre = env.element.parentNode;
    if (!pre || !/pre/i.test(pre.nodeName)) {
      return;
    }
    var language = pre.getAttribute('data-language') || Languages[env.language] || (env.language.substring(0, 1).toUpperCase() + env.language.substring(1));

    var element = document.createElement('span');
    element.textContent = language;

    return element;
  });

})();

(function () {
  if (typeof self === 'undefined' || !self.Prism || !self.document) {
    return;
  }

  if (!Prism.plugins.toolbar) {
    console.warn('Copy to Clipboard plugin loaded before Toolbar plugin.');

    return;
  }

  var Clipboard = window.Clipboard || undefined;

  if (/(native code)/.test(Clipboard.toString())) {
    Clipboard = undefined;
  }

  if (!Clipboard && typeof require === 'function') {
    Clipboard = require('clipboard');
  }

  var callbacks = [];

  if (!Clipboard) {
    var script = document.createElement('script');
    var head = document.querySelector('head');

    script.onload = function () {
      Clipboard = window.Clipboard;

      if (Clipboard) {
        while (callbacks.length) {
          callbacks.pop()();
        }
      }
    };

    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.8/clipboard.min.js';
    head.appendChild(script);
  }

  Prism.plugins.toolbar.registerButton('copy-to-clipboard', function (env) {
    var linkCopy = document.createElement('a');
    linkCopy.textContent = 'Copy';

    if (!Clipboard) {
      callbacks.push(registerClipboard);
    } else {
      registerClipboard();
    }

    return linkCopy;

    function registerClipboard() {
      var clip = new Clipboard(linkCopy, {
        'text': function () {
          return env.code;
        }
      });

      clip.on('success', function () {
        linkCopy.textContent = 'Copied!';

        resetText();
      });
      clip.on('error', function () {
        linkCopy.textContent = 'Press Ctrl+C to copy';

        resetText();
      });
    }

    function resetText() {
      setTimeout(function () {
        linkCopy.textContent = 'Copy';
      }, 5000);
    }
  });
})();

