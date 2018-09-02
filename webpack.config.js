const path = require("path");
const IS_DEMO = process.env.NODE_ENV === "demo";

module.exports = {
  entry: {
    sw: __dirname + "/src/sw.js"
  },
  resolve: {
    alias: {
      fs: __dirname + "/src/dummyFS.js"
    }
  },
  output: {
    path: path.resolve(__dirname, IS_DEMO ? "demo" : "dist"),
    filename: "[name].js"
  }
};
