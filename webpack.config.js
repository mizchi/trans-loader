const path = require("path");
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
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js"
  }
};
