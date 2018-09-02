import path from "path";
import { compileBabel, compileTypeScript } from "./compilers";
import { Processor } from "./types";

const FALLBACK_EXT = [
  ".js",
  ".ts",
  ".tsx",
  "/index.js",
  "/index.ts",
  "/index.tsx"
];

export const selectWithExt: Processor = async ctx => {
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

export const transformByExt: Processor = async ctx => {
  const extname = path.extname(ctx.url);
  if ([".js", ".mjs"].includes(extname)) {
    return await transformBabel(ctx);
  }
  if ([".ts", ".tsx"].includes(extname)) {
    return await transformTypeScript(ctx);
  }
  return ctx;
};

export const loadByFetch: Processor = async ctx => {
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
