const { join } = require('path');
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

function defineDevtool(num) {
  switch (num) {
    case 1:
      return 'eval';
    case 2:
      return 'cheap-module-eval-source-map';
    default:
      return 'source-map';
  }
}

module.exports = env => {
  // Initial configurations
  const srcDir = join(__dirname, 'src');
  const devDir = join(__dirname, 'app');
  const prodDir = join(__dirname, 'dist');
  const devPort = 9000;
  const devtool = defineDevtool(3);
  const stats = 1 ? { assets: true } : { colors: true, reasons: true };
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
  const devSassLoader = ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: [
      {
        loader: 'css-loader',
        options: { sourceMap: true, importLoaders: 1 },
      },
      'sass-loader',
    ],
  });
  // Typescript compiling configurations
  const tsBundleConfig = {
    context: srcDir,
    entry: {
      main: './app.ts',
      css: './css/app.scss',
    },
    output: {
      path: devDir,
      filename: '[name]/bundle.js',
      publicPath: '/app/main/',
      pathinfo: true,
    },
    stats,
    devtool,
    devServer: {
      hot: true,
      open: true,
      port: devPort,
      publicPath: '/app/main/',
      // https: true,
      compress: true,
      historyApiFallback: { disableDotRule: true },
    },
    resolve: { extensions },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: srcDir,
          use: 'awesome-typescript-loader',
        },
        {
          test: /\.scss$/,
          include: join(srcDir, 'css'),
          use: devSassLoader,
        },
      ],
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new ExtractTextPlugin({ filename: '[name]/bundle.css', allChunks: true }),
    ],
  };
  // Webpack configurations
  if (env.prod) {
    delete tsBundleConfig.devtool;
    delete tsBundleConfig.devServer;
    delete tsBundleConfig.output.pathinfo;
    tsBundleConfig.output = {
      path: prodDir,
      filename: '[name]/bundle.js',
      publicPath: '/dist/main/',
    };
    tsBundleConfig.stats = 'normal';
    tsBundleConfig.plugins = [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"',
        },
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        filename: 'main/manifest.js',
        minChunks: Infinity,
      }),
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { discardComments: { removeAll: true } },
        canPrint: true,
      }),
      new webpack.optimize.UglifyJsPlugin({
        comments: false,
      }),
      new ExtractTextPlugin({ filename: '[name]/bundle.css', allChunks: true }),
    ];
  }
  const config = [tsBundleConfig];
  return config;
};
