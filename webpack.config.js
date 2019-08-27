const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const noShadowDom = process.argv.indexOf('--noShadowDom') !== -1;
console.log('-----');
console.log(process.argv);
console.log('arguments: ' + process.argv.slice(2));
console.log(noShadowDom);

const webpackConfig = {
    mode: 'development',
    entry: './index.ts',
    // devtool: 'inline-source-map',
    devtool: 'source-map',
    devServer: {
        contentBase: './',
        // compress: true,
        host: 'localhost',
        port: 3080,
        watchOptions: {
            ignored: /node_modules/
        },
        inline: true
    },
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
                    // {
                    //     loader: 'style-loader',
                    //     options: {
                    //         sourceMap: true,
                    //     },
                    // },
                    {
                        loader: 'css-loader',
                        // options: {
                        //     modules: {
                        //         localIdentName: 'base-select'
                        //     }
                        // }
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
                use: {loader: 'html-loader?exportAsEs6Default'}
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
        library: 'select',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
            meta: noShadowDom ? {opts: 'noShadowDom'} : {}
        })
    ]
};

if (noShadowDom) {
    webpackConfig.module.rules[1].use.unshift({
        loader: 'style-loader'
    });
}

module.exports = webpackConfig;
