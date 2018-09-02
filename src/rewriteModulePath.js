// this script refer to self.__package
const url = require("url");
const path = require("path");

export default function rewriteModulePath({ types }) {
  return {
    pre(file) {
      this.types = types;
    },

    visitor: {
      ImportDeclaration(nodePath) {
        const importTarget = nodePath.node.source.value;
        const isRelative = importTarget[0] === ".";
        if (isRelative) {
          nodePath.node.source.value = importTarget;
        } else if (importTarget.includes("https://")) {
          return;
        } else {
          const pkg = this.opts.package;
          const version =
            typeof self === "object" &&
            pkg &&
            pkg.dependencies &&
            pkg.dependencies[importTarget];
          const target = importTarget + (!!version ? "@" + version : "");
          nodePath.node.source.value = `https://dev.jspm.io/${target}`;
        }
      }
    }
  };
}
