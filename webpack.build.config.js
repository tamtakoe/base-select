const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const ExtractTextPlugin = require("extract-text-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
    // mode: 'production',
    // mode: 'development',
    // entry: './index.ts',
    entry: './src/select.ts',
    // devtool: 'inline-source-map',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader?configFileName=./tsconfig.json',
                exclude: /node_modules/
            },
            {
                test: /\.(css|scss)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            localIdentName: 'base-select'
                        }
                    },
                    {
                        loader: 'resolve-url-loader',
                    },
                    {
                        loader: 'sass-loader?outputStyle=expanded&sourceMap',
                    },
                ],
            },
            {
                test: /\.html$/,
                // loader: 'html-loader'
                // loader: 'file-loader'
                // use: {loader: 'html'}
                // use: {loader: "es6-template-string"}
                // use: {loader: 'html-loader'}
                use: {loader: 'html-loader?exportAsEs6Default'}
                // use: {loader: 'raw-loader'}
                // use: {
                //     loader: 'html-loader',
                //     loadedListItems: {
                //         attrs: [':data-src']
                //     }
                // }
            }, {
                test: /\.(eot|ttf|woff|woff2)$/,
                loader: 'file-loader?name=fonts/[name].[ext]',
            }, {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: 'url-loader?limit=10000&hash=sha512&digest=hex&name=[hash].[ext]',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.css', '.scss', '.html', '.json']
    },
    output: {
        filename: 'select.js',
        path: path.resolve(__dirname, 'dist'),
        // library: 'ui',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    // optimization: {
    //     // minimize: true,
    //     // minimizer: [new UglifyJsPlugin({
    //     //     include: /\.min\.js$/
    //     // })]
    //     minimizer: [
    //         // new UglifyJsPlugin({
    //         //     cache: true,
    //         //     parallel: true,
    //         //     sourceMap: true // set to true if you want JS source maps
    //         // }),
    //         new OptimizeCSSAssetsPlugin({
    //             assetNameRegExp: /\.min\.js$/
    //         })
    //     ]
    // },
    plugins: [
        new OptimizeCSSAssetsPlugin(),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "style.css",
            // chunkFilename: "[id].css"
        })
    ],
};