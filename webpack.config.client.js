const webpack = require("webpack");

module.exports = {
    entry: {
        "static/matome_client": "./src/client.tsx"
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
                test: /\.ejs$/,
                use: [
                    {loader: 'ejs-compiled-loader?htmlmin'}
                ]
            }
        ]
    }
};