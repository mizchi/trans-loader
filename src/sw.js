import path from "path";
import ensurePackageLoading from "./ensurePackageLoading";
import { transformWithBabel } from "./transformWithBabel";
import { transformWithTypeScript } from "./transformWithTypeScript";

const compilers = {
  ".js": transformWithBabel,
  ".ts": transformWithTypeScript,
  ".tsx": transformWithTypeScript
};

self.addEventListener("install", e => e.waitUntil(self.skipWaiting()));
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", event => {
  if (event.request.url.indexOf("dev.jspm.io") > -1) {
    // cache jspm result
    event.respondWith(
      caches.match(event.request).then(res => {
        return (
          res ||
          caches.open("1").then(cache => {
            return fetch(event.request).then(response => {
              cache.put(event.request, response.clone());
              console.info("trans-loader: Cache", event.request.url);
              return response;
            });
          })
        );
      })
    );
  } else {
    const extname = path.extname(event.request.url);
    const compiler = compilers[extname];
    // add `.js` ext
    // TODO: Add `.ts` if target is typescript
    const url =
      extname.length > 0 ? event.request.url : event.request.url + ".js";
    if (compiler) {
      event.respondWith(
        // load __package before transform
        ensurePackageLoading().then(() =>
          fetch(url)
            .then(res => res.text())
            .then(source => {
              const output = compiler(source);
              return new Response(output, {
                mode: "no-cors",
                headers: { "Content-Type": "text/javascript" }
              });
            })
        )
      );
    }
  }
});
