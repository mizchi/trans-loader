# trans-loader

You don't need **npm** and **bundler** like webpack.

This is just a `service-worker` script

- transform babel
- transform typescript
- load npm modules from [jspm.io](https://jspm.io)

## CAUTION!

- **development only**. Do not use for production.
- It works only for modern browser(ES Modules ready).

## How it works

Rewrite npm module path to `dev.jspm.io`.

```js
// before
import React from "react";
// after compiled
import React from "https://dev.jspm.io/react";
```

## How to use

Put [dist/sw.js](/dist/sw.js) as `/sw.js` on your app root.

```sh
wget https://raw.githubusercontent.com/mizchi/trans-loader/master/dist/sw.js
```

Rewrite your code like below.

Before

```html
<script src="/your-entry.js"></script>
```

After

```html
<script type=module>
(async () => {
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  import('/your-entry.js')
})()
</script>
```

See working [demo](/demo)

TIPS: If it does not work at first, please reload once. I will fix to ensure this script

## Example 1: Compiled with babel

```js
// /your-entry.js
import React from "react"; // load from 'dev.jspm.io/react'
import ReactDOM from "react-dom";
ReactDOM.render(<h1>Hello</h1>, document.querySelector(".root"));
```

## Example 2: Load relative file

```
index.html
sw.js
main.js
components/App.js
```

```js
// main.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App"; // load relative directly from './main.js'
ReactDOM.render(<App />, document.querySelector(".root"));
```

## Advanced: How to build your own trans-loader

Rewrite this babel setting and rebuild this project.

```js
// src/transformWithBabel.js
import { transform } from "@babel/core/lib/transform";
import pluginSyntaxDynamicImport from "@babel/plugin-syntax-dynamic-import";
import flow from "@babel/preset-flow";
import react from "@babel/preset-react";
import rewriteModulePath from "./rewriteModulePath";

export function transformWithBabel(source, filename = "") {
  return transform(source, {
    presets: [flow, react],
    plugins: [
      pluginSyntaxDynamicImport,
      [
        rewriteModulePath,
        {
          filename
        }
      ]
    ]
  }).code;
}
```

## TODO

- Ensure service-worker loading
- Support `package.json` to load with version
- Can load without extname for `.ts`

## LICENSE

MIT
