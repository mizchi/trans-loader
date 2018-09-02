declare var self: any;

import ensurePackage from "./ensurePackage";
import { initState, process } from "./processor";
import { loadByFetch, selectWithExt, transformByExt } from "./transformers";

console.log(new Date());

self.addEventListener("install", (ev: any) => ev.waitUntil(self.skipWaiting()));

self.addEventListener("activate", (ev: any) =>
  ev.waitUntil(self.clients.claim())
);

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

// helpers

async function respondWithTransform(url: string) {
  await ensurePackage();
  const processors = [selectWithExt, loadByFetch, transformByExt];
  const ctx = initState(url);
  const output = await process(ctx, processors);
  return new Response(output.content, {
    mode: "no-cors",
    headers: { "Content-Type": "text/javascript" }
  } as any);
}

async function useCacheOrLoad(request: any) {
  const res = await caches.match(request);
  if (res) {
    return res;
  }
  const cache = await caches.open("1");
  const response = await fetch(request);
  await cache.put(request, response.clone());
  console.info("trans-loader: Cache", request.url);
  return response;
}
