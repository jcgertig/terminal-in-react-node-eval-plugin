# Node Eval Plugin

[![Downloads][npm-dm]][package-url]
[![Downloads][npm-dt]][package-url]
[![NPM Version][npm-v]][package-url]
[![Dependencies][deps]][package-url]
[![Dev Dependencies][dev-deps]][package-url]
[![License][license]][package-url]

__Plugin to add node evaluation and repl to terminal-in-react__

<p align="center">
  <img src="http://g.recordit.co/9eWglWTCQs.gif" />
</p>

# Install

```bash
npm i -S terminal-in-react-node-eval-plugin
```

```bash
yarn add terminal-in-react-node-eval-plugin
```

# Usage
The plugin requires a file system plugin to work currently `terminal-in-react-pseudo-file-system-plugin` is the only one available. You have
to pass the name of the file system plugin as a config option.


```jsx
import NodeEvalPlugin from 'terminal-in-react-node-eval-plugin';
import pseudoFileSystemPlugin from 'terminal-in-react-pseudo-file-system-plugin';
const FileSystemPlugin = pseudoFileSystemPlugin();

...
<Terminal
  plugins={[
    FileSystemPlugin,
    {
      class: NodeEvalPlugin,
      config: {
        filesystem: FileSystemPlugin.displayName
      }
    }
  ]}
/>
...
```

# Commands
The commands it adds are:

 - `node`

# Plugin public methods
The methods available to other plugins

 - `node`

# TODO

 - [x] Eval files
 - [x] Node repl
 - [ ] Eval node requires
 - [ ] Run as process (web workers)

[npm-dm]: https://img.shields.io/npm/dm/terminal-in-react-node-eval-plugin.svg
[npm-dt]: https://img.shields.io/npm/dt/terminal-in-react-node-eval-plugin.svg
[npm-v]: https://img.shields.io/npm/v/terminal-in-react-node-eval-plugin.svg
[deps]: https://img.shields.io/david/jcgertig/terminal-in-react-node-eval-plugin.svg
[dev-deps]: https://img.shields.io/david/dev/jcgertig/terminal-in-react-node-eval-plugin.svg
[license]: https://img.shields.io/npm/l/terminal-in-react-node-eval-plugin.svg
[package-url]: https://npmjs.com/package/terminal-in-react-node-eval-plugin
