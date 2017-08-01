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

  constructor(api, config = { filesystem: 'Pass `filesystem` into config' }) {
    super(api, config);
  }

  commands = {
    node: this.runEvalCommand(),
  };

  descriptions = {
    node: false,
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
}
