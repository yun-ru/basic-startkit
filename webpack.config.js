var path = require("path");

module.exports = {
    entry: "./src/js/entry.js",
    output: {
        path: path.join(__dirname,"src/js"),
        filename: "bundle.js"
    },
    module: {
        loaders: [
            // { test: /\.jade$/, loader: "jade" },
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};