// this script refer to self.__package
const url = require("url");
const path = require("path");

export default function rewriteModulePath({ types }) {
  return {
    pre(file) {
      this.types = types;
      // this._dirname = path.dirname(this.opts.filename || file.opts.filename);
      // this._dirname = path.dirname(this.opts.filename || file.opts.filename);
      console.log("rewrite", file, this);
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
          const pkg = this.opts.package;
          const version =
            typeof self === "object" &&
            pkg &&
            pkg.dependencies &&
            pkg.dependencies[importTarget];
          // (self.__package.devDependencies &&
          //   self.__package.devDependencies[importTarget]);
          const target = importTarget + (!!version ? "@" + version : "");
          nodePath.node.source.value = `https://dev.jspm.io/${target}`;
        }
      }
    }
  };
}
