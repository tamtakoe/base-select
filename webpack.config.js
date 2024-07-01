const path = require("path")
const { parseArgs } = require('util');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const DtsBundleWebpack = require('dts-bundle-webpack')
const { values: args } = parseArgs({options: { mode: { type: 'string' }}, strict: false });
const isProduction = args.mode === 'production'

module.exports = {
   entry: {
      'index':'./index.ts',
      'select': './src/select.ts',
      'select-base': './src/select.scss',
      'select-bootstrap': './src/select-bootstrap.scss',
      'select-material': './src/select-material.scss',
   },
   output: {
      filename: '[name].js',
      path: path.resolve(__dirname, "dist"),
      clean: true,
      library: {
        type: 'umd', // Exports as ES6-like module and as global variables
      }
  },
  module: {
    rules: [
        { // Convert ans concat .ts files to .js
            test: /\.tsx?$/,
            use: {
              loader: 'ts-loader',
              options: {
                configFile: isProduction ? 'tsconfig.build.json' : 'tsconfig.json',
              }
            },
            exclude: /node_modules/,
        },
        {
            test: /\.s[ac]ss$/,
            oneOf: [
              {
                resourceQuery: /module/, // Convert .scss?module imports to inline ES6 modules
                use: ["css-loader", "sass-loader"],
              }, { // Convert .scss files to .css 
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
              },
            ],
        },
        { // Allow to import .html-templates to .ts-files
            test: /\.html$/,
            use: "html-loader",
        }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ].concat(isProduction ? [
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [
            { source: './dist/src/*.d.ts', destination: './dist/' },
            { source: './index-demo.html', destination: './dist/index.html' },
            { source: './index.css', destination: './dist/index.css' }
          ],
          delete: [ './dist/demo', './dist/src', './dist/select-*.js', './dist/index.d.ts' ]
        }
      }
    }),
    new DtsBundleWebpack({
      name: 'select',
      main: 'dist/**/*.d.ts',
      out: 'select.d.ts',
      removeSource: true,
      outputAsModuleFolder: true
    })
  ] : [
    new HtmlWebpackPlugin({ // Serve index.html
      template: path.resolve(__dirname, "index.html"),
      chunks: ['index']
    })
  ]),
  devtool: isProduction ? false : "inline-source-map",
  devServer: {
    hot: true
  },
}