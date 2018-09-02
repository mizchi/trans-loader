const path = require("path");
const IS_DEMO = process.env.NODE_ENV === "demo";

module.exports = {
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    alias: {
      fs: __dirname + "/src/dummyFS.js"
    }
  },
  output: {
    path: path.resolve(__dirname, IS_DEMO ? "demo" : "dist"),
    filename: "sw.js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true
            }
          }
        ]
      }
    ]
  }
};
