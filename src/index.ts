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
  return processors.reduce((acc, prs) => {
    return acc.then(ctx => {
      return prs(ctx);
    });
  }, Promise.resolve(current));
}

const loadByFetch: Processor = async ctx => {
  const res = await fetch(ctx.url);
  const content = await res.text();
  return {
    ...ctx,
    content
  };
};

loadByFetch.toString = () => "load-by-fetch";

const transformBabel: Processor = async ctx => {
  return {
    ...ctx,
    content: compileBabel(ctx.content)
  };
};
transformBabel.toString = () => "tranform-babel";

const transformTypeScript: Processor = async ctx => {
  return {
    ...ctx,
    content: compileTypeScript(ctx.content)
  };
};

transformTypeScript.toString = () => "tranform-typescript";

const FALLBACK_EXT = [
  ".js",
  ".ts",
  ".tsx",
  "/index.js",
  "/index.ts",
  "/index.tsx"
];

const selectWithExt: Processor = async ctx => {
  const extname = path.extname(ctx.originalUrl);
  if (extname.length > 0) {
    return ctx;
  }

  const urls: any = await Promise.all(
    FALLBACK_EXT.map(ext => {
      return fetch(ctx.originalUrl + ext)
        .then(res => (res.status >= 400 ? "" : ctx.originalUrl + ext))
        .catch(_e => "");
    })
  );

  const url = urls.find((u: string) => u);
  return {
    ...ctx,
    url
  };
};

selectWithExt.toString = () => "select-with-ext";

const transformByExt: Processor = async ctx => {
  const extname = path.extname(ctx.url);
  if ([".js", ".mjs"].includes(extname)) {
    return await transformBabel(ctx);
  }
  if ([".ts", ".tsx"].includes(extname)) {
    return await transformTypeScript(ctx);
  }
  return ctx;
};

self.addEventListener("install", (e: any) => e.waitUntil(self.skipWaiting()));

self.addEventListener("activate", (e: any) =>
  e.waitUntil(self.clients.claim())
);

async function load(url: string) {
  await ensurePackageLoading();
  const processors = [selectWithExt, loadByFetch, transformByExt];
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
  await cache.put(request, response.clone());
  console.info("trans-loader: Cache", request.url);
  return response;
}

self.addEventListener("fetch", (event: any) => {
  if (event.request.url.indexOf("dev.jspm.io") > -1) {
    // cache jspm result
    event.respondWith(useCacheOrLoad(event.request));
  } else if (event.request.url.indexOf("/src/") > -1) {
    // transform
    console.log("transform", event.request.url);
    event.respondWith(load(event.request.url));
  }
});
