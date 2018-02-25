import PluginBase from 'terminal-in-react/lib/js/components/Plugin';
import { autobind } from 'core-decorators';
// import memoize from 'memoizerific';

// Scope class
//   aScope.eval(str) -- eval a string within the scope
//   aScope.newNames(name...) - adds vars to the scope
function Scope(print) { // eslint-disable-line no-unused-vars
  "use strict"; // eslint-disable-line
  this.names = [];
  this.evaled = [];
  this.eval = function ev(s) {
    const toEval = [
      'console.log = function () {};',
      ...this.evaled,
      '(function(){',
      'if (true) { console.log = print; }',
      `print((() => eval("${s}"))())`,
      '})()',
    ].join(';\n');
    this.evaled = [...this.evaled, s];
    return eval(toEval);  // eslint-disable-line
  };
  this.removeLast = function rl() {
    this.evaled.pop();
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
      const scope = new Scope(() => {});
      this.runEval(scope, content);
    },
  });

  handleLog = (...args) => {
    this.api.printLine(args);
  };

  // @decorate(memoize(500))
  runEval(scope, content) { // eslint-disable-line class-methods-use-this
    function run() {
      "use strict"; // eslint-disable-line
      try {
        return Promise.resolve(scope.eval(content)); // eslint-disable-line
      } catch (e) {
        scope.removeLast();
        return Promise.reject(e);
      }
    }
    return run()
      .catch((err) => {
        this.api.printLine(`Error: ${err.message}`);
      });
  }

  stopControl() {
    if (this.stopFirst === true) {
      this.api.releaseControl();
    } else {
      this.stopFirst = true;
      this.api.printLine('(To exit, press ^C again or type .exit)');
    }
  }

  takeControl() {
    "use strict"; // eslint-disable-line
    const scope = new Scope(this.handleLog);
    this.api.takeControl({
      shortcuts: {
        'win, linux, darwin': {
          'ctrl + c': this.stopControl,
        },
      },
      runCommand: (inputText) => {
        if (this.stopFirst === true && inputText === '.exit') {
          this.api.releaseControl();
        } else {
          this.stopFirst = false;
          this.runEval.bind(this)(scope, inputText)
            .then((res) => {
              this.api.printLine(typeof res !== 'function' ? res : res());
            });
        }
      },
    }, '>', '');
  }

  runEvalCommand() {
    return {
      needsInstance: true,
      method: (args) => {
        this.parsePath = this.api.getPluginMethod(this.config.filesystem, 'parsePath');
        this.readFile = this.api.getPluginMethod(this.config.filesystem, 'readFile');
        if (args._.length > 0) {
          const path = this.parsePath(args._[0]);
          const file = this.readFile(path);
          if (file !== null && typeof file === 'string') {
            "use strict"; // eslint-disable-line
            const scope = new Scope(() => {});
            this.runEval.bind(this)(scope, file);
          }
        } else if (this.api.checkVersion('>=', '4.3.0')) {
          this.takeControl();
        } else {
          this.api.printLine('Node repl only works in Terminal versions above 4.2.X');
        }
      },
    };
  }
}
