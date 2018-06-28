import * as ts from "typescript";
import { transformWithBabelModulePathOnly } from "./transformWithBabel";

const compilerOptions = {
  module: ts.ModuleKind.ESNext,
  sourcemap: false,
  jsx: "react"
};

export function transformWithTypeScript(source) {
  const tsCompiled = ts.transpileModule(source, { compilerOptions });
  return transformWithBabelModulePathOnly(tsCompiled.outputText);
}
