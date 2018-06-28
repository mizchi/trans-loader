// this script refer to self.__package
const url = require("url");
const path = require("path");

export default function rewriteModulePath({ types }) {
  return {
    pre(file) {
      this.types = types;
      this._dirname = path.dirname(this.opts.filename || file.opts.filename);
    },

    visitor: {
      ImportDeclaration(nodePath) {
        const importTarget = nodePath.node.source.value;
        const isRelative = importTarget[0] === ".";
        if (isRelative) {
          // add .js
          const extname = path.extname(importTarget);
          const importTargetWithExt = importTarget + (extname ? "" : ".js");
          nodePath.node.source.value = importTargetWithExt;
        } else if (importTarget.includes("https://")) {
          return;
        } else {
          // add version
          const version =
            typeof self === "object" && // in service worker
            self.__package && // ensure __package
            self.__package.dependencies &&
            self.__package.dependencies[importTarget];
          // (self.__package.devDependencies &&
          //   self.__package.devDependencies[importTarget]);
          const target = importTarget + (!!version ? "@" + version : "");
          nodePath.node.source.value = `https://dev.jspm.io/${target}`;
        }
      }
    }
  };
}
