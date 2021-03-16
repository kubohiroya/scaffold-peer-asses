const webpack = require('webpack');
const path = require("path");
const GasPlugin = require("gas-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv');
const env = dotenv.config().parsed;

const gasWebpackDevServerHtmlFilePath = require.resolve(
    'google-apps-script-webpack-dev-server'
);

module.exports = {
  mode: "development",
    devtool: false,
    // cache: {type: 'filesystem'},
  context: __dirname,
  entry: {
      main: path.resolve(__dirname, "src/app", "index.ts"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
      rules: [
          {
              test: /\.[tj]s$/,
              exclude: /node_modules/,
              loader: "ts-loader",
          },
          {
              test: /\.html$/,
              exclude: /node_modules/,
              use: {
                  loader: 'file-loader',
                  options: {
                      name: '[name].[ext]'
                  },
              },
          },
          {
              test: /\.json$/,
              exclude: /node_modules/,
              use: {
                  loader: "file-loader",
                  options: {
                      name: './[name].[ext]'
                  },
              },
          },
      ],
  },
  plugins: [
      new GasPlugin(),
      new webpack.DefinePlugin({
          'process.env': JSON.stringify(env)
      }),
      new CopyWebpackPlugin({
              patterns: [
                  {
                      from: './src/app/html',
                      to: '.'
                  },
              ],
          }
      ),
      new CopyWebpackPlugin({
              patterns: [
                  {
                      from: './src/appsscript.json',
                      to: '.'
                  },
              ],
          }
      )
  ],
    devServer: {
        port: 3000,
        before: function (app, server, compiler) {
            app.get('/gas/*', (req, res) => {
                res.setHeader('Content-Type', 'text/html');
                createReadStream(gasWebpackDevServerHtmlFilePath).pipe(res);
            });
        },
    }
};
