const webpack = require("webpack");

module.exports = {
    entry: {
        "static/matome_client": "./src/client_main.ts"
    },
    output: {
        filename: "./build/[name].js"
    },
    devtool: "source-map",
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {loader: "ts-loader"}
                ]
            },
            {
                test: /\.json$/,
                use: [
                    {loader: 'json-loader'}
                ]
            }
        ]
    }
};
