declare var self: any;

import path from "path";
import ensurePackageLoading from "./ensurePackageLoading";
import { compileBabel, compileTypeScript } from "./compilers";

import { Context, Processor } from "./types";

console.log(new Date());

const initState = (url: string): Context => ({
  filename: path.basename(url),
  url,
  originalUrl: url,
  content: null
});

async function process(
  ctx: Context,
  processors: Processor[]
): Promise<Context> {
  let current = ctx;
  for (const processor of processors) {
    current = await processor(current);
  }
  return current;
}

const loadByFetch: Processor = async ctx => {
  const res = await fetch(ctx.url);
  const content = await res.text();
  return {
    ...ctx,
    content
  };
};

const transformBabel: Processor = async ctx => {
  return {
    ...ctx,
    content: compileBabel(ctx.content)
  };
};

const transformTypeScript: Processor = async ctx => {
  return {
    ...ctx,
    content: compileTypeScript(ctx.content)
  };
};

const processorMap: { [extname: string]: Processor[] } = {
  ".js": [loadByFetch, transformBabel],
  ".ts": [loadByFetch, transformTypeScript],
  ".tsx": [loadByFetch, transformTypeScript]
};

self.addEventListener("install", (e: any) => e.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (e: any) =>
  e.waitUntil(self.clients.claim())
);

async function load(url: string) {
  await ensurePackageLoading();
  const extname = path.extname(url);
  const processors = processorMap[extname];
  const ctx: Context = initState(url);
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
  cache.put(request, response.clone());
  console.info("trans-loader: Cache", request.url);
  return response;
}

self.addEventListener("fetch", (event: any) => {
  if (event.request.url.indexOf("dev.jspm.io") > -1) {
    // cache jspm result
    event.respondWith(useCacheOrLoad(event.request));
  } else {
    const extname = path.extname(event.request.url);
    const processor = processorMap[extname]; // add `.js` ext
    // TODO: Add `.ts` if target is typescript
    if (processor) {
      event.respondWith(load(event.request.url));
    }
  }
});
