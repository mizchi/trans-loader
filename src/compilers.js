import { transform } from "@babel/core/lib/transform";
import flow from "@babel/preset-flow";
import ts from "@babel/preset-typescript";
import react from "@babel/preset-react";

import syntaxDynamicImport from "@babel/plugin-syntax-dynamic-import";
import transformObjcetRestSpread from "@babel/plugin-proposal-object-rest-spread";
import transformClassProperties from "@babel/plugin-proposal-class-properties";
import pluginRewriteModulePath from "./rewriteModulePath";

export function compileBabel(source, filename = "") {
  return transform(source, {
    presets: [flow, react],
    plugins: [
      syntaxDynamicImport,
      transformObjcetRestSpread,
      transformClassProperties,
      [
        pluginRewriteModulePath,
        {
          filename,
          package: self.__package
        }
      ]
    ]
  }).code;
}

export function compileTypeScript(source, filename = "") {
  return transform(source, {
    // TODO: add filename
    filename: "file.tsx",
    presets: [ts, react],
    plugins: [
      syntaxDynamicImport,
      transformObjcetRestSpread,
      transformClassProperties,
      [
        pluginRewriteModulePath,
        {
          filename,
          package: self.__package
        }
      ]
    ]
  }).code;
}

export function compileModulePath(source, filename = "") {
  return transform(source, {
    plugins: [
      pluginSyntaxDynamicImport,
      objcetRestSpread,
      transformClassProperties,
      [
        pluginRewriteModulePath,
        {
          filename,
          package: self.__package
        }
      ]
    ]
  }).code;
}
