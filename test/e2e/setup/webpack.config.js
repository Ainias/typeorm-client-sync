const webpack = require('webpack');
const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');

let mode = (process.env.MODE || "development");
let moduleExports = {

    //Development oder production, wird oben durch Variable angegeben (damit später per IF überprüft)
    mode,

    devtool: "eval-source-map",
    entry: [
        __dirname + "/client/index.ts",
    ],
    // devtool: 'inline-source-map',

    //Gibt Ausgabename und Ort für JS-File an
    output: {
        path: path.resolve(__dirname, 'server/public'),
        filename: 'index.js'
    },
    optimization: {
        mangleExports: false,
        minimize: false,
    },
    resolve: {
        extensions: [".ts", ".js"],
        fallback: {fs: false, path: false, crypto: false}
    },

    plugins: [
        new webpack.NormalModuleReplacementPlugin(/typeorm$/, function (result) {
            result.request = result.request.replace(/typeorm/, "typeorm/browser");
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm'),
                    to: path.resolve(__dirname, 'server/public/'),
                },
                {
                    from: path.resolve(__dirname, 'node_modules/localforage/dist/localforage.js'),
                    to: path.resolve(__dirname, 'server/public/'),
                },
            ],
        })
    ],

    module: {

        //Regeln: Wenn Regex zutrifft => führe Loader (in UMGEKEHRTER) Reihenfolge aus
        rules: [
            {
                test: /\.tsx?$/,
                use: ["ts-loader"],
            },
        ]
    },
};
module.exports = moduleExports;
