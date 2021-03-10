const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    TermiWidget: './src/TermiWidget.js',
    MLB: './src/MLB.js',
  },
  output: {
    path:path.resolve(__dirname, "dist"),
  },
  experiments: {
    topLevelAwait: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: (file, map, minimizerOptions) => {
          let code = file[Object.keys(file)[0]];
          const pattern = /\/\/ Variables used by Scriptable([^\0]*?)\/[\*]+\//;
          const matches = code.match(pattern)
          code = matches[0] + '\n' + code.replace(pattern, '');

          return { map, code };
        },
      }),
    ],
  },
  // plugins: [
  //   new webpack.BannerPlugin({
  //     banner: (va) => {
  //       console.log(Object.keys(va.chunk));
  //       console.log(va.chunk.files)
  //       return 'hello world';
  //     }
  //   })
  // ]
}