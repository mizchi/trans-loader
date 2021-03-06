# trans-loader

You don't need **npm** and **bundler**.

You need just a `service-worker` script.

## What this script does...

- Transform `.js` with babel on service-worker
- Transform `.ts` and `.tsx` with typescript on service-worker
- Load modules from [jspm.io](https://jspm.io) and cache them on serviceWorker.

## CAUTION!

- **development only**. Do not use for production.
- It works only for modern browser(ES2015+ and ES Modules ready).

## How to use

Put [dist/sw.js](/dist/sw.js) as `/sw.js` on your app root.

```sh
wget https://raw.githubusercontent.com/mizchi/trans-loader/master/dist/sw.js
```

Rewrite your entry js like below.

Before

```html
<script src="/src/main.js"></script>
```

After

```html
<script type=module>
(async () => {
  const run = () => import('/src/main.js') // your entry js
  if (navigator.serviceWorker.controller) {
    run()
  } else {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    navigator.serviceWorker.addEventListener('controllerchange', run)
  }
})()
</script>
```

See [working demo](/demo)

## Example 1: Compiled with babel

```js
// /your-entry.js
import React from "react";
import ReactDOM from "react-dom";
ReactDOM.render(<h1>Hello</h1>, document.querySelector(".root"));
```

## Example 2: Load relative file

```
index.html
sw.js
src/main.js
src/components/App.js
```

```js
// main.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
ReactDOM.render(<App />, document.querySelector(".root"));
```

## Example 3: Load typescript

```
index.html
sw.js
src/main.js
src/components/App.tsx
```

```js
// main.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
ReactDOM.render(<App />, document.querySelector(".root"));
```

## Example 4: Loading with `package.json`'s version

```
index.html
sw.js
package.json
src/main.js
```

`package.json`

```
{
  "dependencies": {
    "react": "16.4.1",
    "react-dom": "16.4.1"
  }
}
```

Log

```
trans-loader: Cache https://dev.jspm.io/react@16.4.1
trans-loader: Cache https://dev.jspm.io/react-dom@16.4.1
```

## How it works

### Rewrite js content with service-worker proxy

Compile content with babel/typescript by extname

```js
// ...
self.addEventListener("fetch", (event: any) => {
  if (event.request.url.indexOf("dev.jspm.io") > -1) {
    // cache jspm result
    event.respondWith(useCacheOrLoad(event.request));
  } else if (event.request.url.indexOf("/src/") > -1) {
    // transform
    console.log("trans-loader: with-transform", event.request.url);
    event.respondWith(respondWithTransform(event.request.url));
  }
});
```


### Rewrite to dev.jspm.io

Rewrite npm module path to `dev.jspm.io`. See [this code](/src/rewriteModulePath.js)

```js
// before
import React from "react";
// after
import React from "https://dev.jspm.io/react";
```

### Add valid extname

- Try to access `.js, .mjs, .ts, .tsx, /index.js, /index.ts, /index.tsx`
- return file with non-error endpoint

## LICENSE

MIT
