import { transform } from "@babel/core/lib/transform";
import pluginSyntaxDynamicImport from "@babel/plugin-syntax-dynamic-import";
import flow from "@babel/preset-flow";
import ts from "@babel/preset-typescript";
import objcetRestSpread from "@babel/plugin-proposal-object-rest-spread";
import classProperties from "@babel/plugin-proposal-class-properties";

import react from "@babel/preset-react";
import rewriteModulePath from "./rewriteModulePath";

export function transformWithBabel(source, filename = "") {
  return transform(source, {
    presets: [flow, react],
    plugins: [
      pluginSyntaxDynamicImport,
      objcetRestSpread,
      classProperties,
      [
        rewriteModulePath,
        {
          filename
        }
      ]
    ]
  }).code;
}

export function transformWithBabelTS(source, filename = "") {
  return transform(source, {
    // TODO: add filename
    filename: "file.tsx",
    presets: [ts, react],
    plugins: [
      pluginSyntaxDynamicImport,
      objcetRestSpread,
      classProperties,
      [
        rewriteModulePath,
        {
          filename
        }
      ]
    ]
  }).code;
}

export function transformWithBabelModulePathOnly(source, filename = "") {
  return transform(source, {
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
