const webpack = require("webpack");

module.exports = function override(config, env) {
  config.resolve.fallback = {
    fs: false,
    path: require.resolve("path-browserify"),
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    buffer: require.resolve("buffer"),
    process: require.resolve("process/browser"),
    assert: require.resolve("assert"),
    util: require.resolve("util"),
    vm: require.resolve("vm-browserify"),
  };
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    })
  );
  return config;
};
