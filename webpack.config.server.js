const webpack = require("webpack");

module.exports = {
    entry: {
        matome_server: "./src/server.tsx"
    },
    target: "node",
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
