const { join } = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// Initial configurations
const pageTitle = "TypeScript";
const sourceDir = join(__dirname, "src");
const developmentDir = join(__dirname, "app");
const productionDir = join(__dirname, "dist");
const developmentPort = 9000;
const devtool = defineDevtool(3);
const stats = 1 ? { assets: true } : { colors: true, reasons: true };
const extensions = [".ts", ".scss", ".js", ".json"];
const devSassLoader = ExtractTextPlugin.extract({
    fallback: "style-loader",
    use: [
        {
            loader: "css-loader",
            options: { sourceMap: true, importLoaders: 1 },
        },
        "sass-loader",
    ],
});

function defineDevtool(num) {
    switch (num) {
        case 1:
            return "eval";
        case 2:
            return "cheap-module-eval-source-map";
        default:
            return "source-map";
    }
}

module.exports = env => {
    // Typescript compiling configurations
    const tsBundleConfig = {
        // target: "node",
        context: sourceDir,
        entry: {
            main: ["./app", "./css/app"],
            // test: ["../test/test"]
        },
        output: {
            path: developmentDir,
            filename: "[name]/bundle.js",
            publicPath: "/app/",
            pathinfo: true,
        },
        stats,
        devtool,
        devServer: {
            hot: true,
            open: true,
            port: developmentPort,
            publicPath: "/app/",
            compress: true,
            historyApiFallback: { disableDotRule: true },
            contentBase: join(__dirname, "app"),
            // https: true,
        },
        resolve: { extensions },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    include: sourceDir,
                    // exclude: /^node_modules/,
                    use: "awesome-typescript-loader",
                },
                {
                    test: /\.scss$/,
                    include: join(sourceDir, "css"),
                    use: devSassLoader,
                },
            ],
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NamedModulesPlugin(),
            new ExtractTextPlugin({ filename: "css/bundle.css", allChunks: true }),
            new HtmlWebpackPlugin({ title: `${pageTitle} - Dev`, filename: "index.html", template: "../index.ejs" }),
        ],
    };
    // Webpack configurations
    if (env.prod) {
        delete tsBundleConfig.devtool;
        delete tsBundleConfig.devServer;
        delete tsBundleConfig.output.pathinfo;
        tsBundleConfig.externals = [nodeExternals({ importType: "var", whitelist: [/^rxjs/, /^lodash/, /^setimmediate/] })];
        tsBundleConfig.output = {
            path: productionDir,
            filename: "[name]/bundle.js",
            publicPath: "/dist/",
        };
        tsBundleConfig.stats = "normal";
        tsBundleConfig.plugins = [
            new webpack.DefinePlugin({ "process.env": { NODE_ENV: '"production"' } }),
            new webpack.optimize.CommonsChunkPlugin({
                name: "manifest",
                filename: "main/manifest.js",
                minChunks: Infinity,
            }),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.css$/g,
                cssProcessor: require("cssnano"),
                cssProcessorOptions: { discardComments: { removeAll: true } },
                canPrint: true,
            }),
            new webpack.optimize.UglifyJsPlugin({ comments: false }),
            new ExtractTextPlugin({ filename: "css/bundle.css", allChunks: true }),
            new HtmlWebpackPlugin({ title: `${pageTitle}`, filename: "index.html", template: "../index.ejs" }),
        ];
    }
    const config = [tsBundleConfig];
    return config;
};
