const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ChromeExtensionReloader = require("webpack-chrome-extension-reloader");

module.exports = {
  entry: {
    background: './src/background.js',
    'content-script': './src/app/app.js',
    popup: './src/popup.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js'
  },
  resolve: {
    modules: [ path.resolve(__dirname, "src"), path.resolve(__dirname, 
    "node_modules")],
    alias: {"@app": path.resolve(__dirname, "src/app")}
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/popup.html",
      chunks: ['popup'],
      filename: "./popup.html"
    }),
    new CopyWebpackPlugin([
      { from: 'static' }
    ]),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new ChromeExtensionReloader()
  ]
};
