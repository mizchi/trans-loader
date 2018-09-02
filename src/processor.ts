import path from "path";
import { Context, Processor } from "./types";

console.log(new Date());

export const initState = (url: string): Context => ({
  filename: path.basename(url),
  url,
  originalUrl: url,
  content: null
});

export async function process(
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
