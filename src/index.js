import React from 'react'; // eslint-disable-line
import { PluginBase } from 'terminal-in-react'; // eslint-disable-line
import { autobind } from 'core-decorators';
// import memoize from 'memoizerific';

// Scope class
//   aScope.eval(str) -- eval a string within the scope
//   aScope.newNames(name...) - adds vars to the scope
function Scope() {
  "use strict"; // eslint-disable-line
  this.names = [];
  this.eval = function ev(s) {
    return eval(s);  // eslint-disable-line
  };
}

Scope.prototype.newNames = function newNamesFunc() {
  "use strict"; // eslint-disable-line
  const names = [].slice.call(arguments); // eslint-disable-line
  const newNames = names.filter(x => !this.names.includes(x));

  if (newNames.length) {
    const totalNames = newNames.concat(this.names);
    let code = '(function() {\n';

    const len = newNames.length;
    for (let i = 0; i < len; i += 1) {
      code += `var ${newNames[i]} = null;\n`;
    }
    code += 'return function(str) {return eval(str)};\n})()';
    this.eval = this.eval(code);
    this.names = totalNames;
  }
};

@autobind
export default class NodeEval extends PluginBase {
  static displayName = 'NodeEval';
  static version = '1.0.0';

  static defaultConfig = { filesystem: 'Not Given By Config' };

  commands = {
    node: this.runEvalCommand(),
    vi: this.viCommand(),
  };

  descriptions = {
    node: false,
    vi: 'Open a file to be edited',
  };

  getPublicMethods = () => ({
    node: (content) => {
      "use strict"; // eslint-disable-line
      const scope = new Scope();
      this.runEval(scope, content);
    },
  })

  // @decorate(memoize(500))
  runEval(scope, content) { // eslint-disable-line class-methods-use-this
    function run(errCb) {
      "use strict"; // eslint-disable-line
      try {
        scope.eval(content); // eslint-disable-line
      } catch (e) {
        errCb(e);
      }
    }
    run((err) => {
      this.api.printLine(`Error: ${err.message}`);
      // this.api.printLine(<pre>{JSON.stringify(err, null, 2)}</pre>);
    });
  }

  runEvalCommand() {
    return {
      method: (args) => {
        this.parsePath = this.api.getPluginMethod(this.config.filesystem, 'parsePath');
        this.readFile = this.api.getPluginMethod(this.config.filesystem, 'readFile');
        if (args._.length > 0) {
          const path = this.parsePath(args._[0]);
          const file = this.readFile(path);
          if (file !== null && typeof file === 'string') {
            "use strict"; // eslint-disable-line
            const scope = new Scope();
            this.runEval.bind(this)(scope, file);
          }
        }
      },
    };
  }

  runVi(contents, save) {
    const handleChange = (e) => {
      // console.warn(e.target);
    };
    const handleKeyPressOuter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Escape') {
        let str = this.viEditor.innerHTML;
        str = str.replace(/<(\/)?br>/gi, '\n');
        str = str.replace(/<p[^<]*>/gi, '\n');
        str = str.replace(/<div[^<]*>/gi, '\n');
        str = str.replace(/<(?:.|\s)*?>/g, '');
        save(str);
      }
    };
    this.api.printLine((
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'black',
          color: 'inherit',
          padding: 10,
          fontSize: 12,
        }}
        tabIndex="0"
        onKeyUp={handleKeyPressOuter}
      >
        <code
          style={{
            width: '100%',
            height: '100%',
            outline: 'none',
            display: 'block',
          }}
          contentEditable
          ref={(e) => {
            if (e !== null) {
              e.focus();
            }
            this.viEditor = e;
          }}
          onInput={handleChange}
          onBlur={handleChange}
          dangerouslySetInnerHTML={{ __html: contents }}
        />
      </div>
    ));
  }

  viCommand() {
    return {
      method: (args) => {
        const parsePath = this.api.getPluginMethod(this.config.filesystem, 'parsePath');
        const readFile = this.api.getPluginMethod(this.config.filesystem, 'readFile');
        const writeFile = this.api.getPluginMethod(this.config.filesystem, 'writeFile');
        const createFile = this.api.getPluginMethod(this.config.filesystem, 'createFile');
        if (args._.length > 0) {
          const path = parsePath(args._[0]);
          const file = readFile(path);
          if (file !== null && typeof file === 'string') {
            this.runVi(file, (newContents) => {
              writeFile(path, newContents);
              this.api.removeLine();
            });
          } else if (file === null) {
            this.api.removeLine();
            this.runVi('', (newContents) => {
              createFile(path);
              writeFile(path, newContents);
              this.api.removeLine();
            });
          }
        }
      },
    };
  }
}
