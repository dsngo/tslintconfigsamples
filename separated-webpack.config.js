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
  const distDir = join(__dirname, 'app');
  const devPort = 9000;
  const devtool = defineDevtool(3);
  const stats = 1 ? 'detailed' : { colors: true, reasons: true };
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
  // Typescript compiling configurations
  const tsBundleConfig = {
    context: srcDir,
    entry: {
      main: './app.ts',
    },
    output: {
      path: distDir,
      filename: '[name]/bundle.js',
    },
    stats,
    devtool,
    devServer: {
      hot: true,
      open: true,
      port: devPort,
      https: true,
      color: true,
      compress: true,
      progress: true,
      historyApiFallback: { disableDotRule: true },
    },
    resolve: { extensions },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"',
        },
      }),
      // new webpack.HotModuleReplacementPlugin(),
      // new webpack.NamedModulesPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: srcDir,
          use: 'awesome-typescript-loader',
        },
      ],
    },
    plugins: [],
  };
  const sassBundleConfigurations = {
    context: srcDir,
    entry: { 'bundle': './css/app.scss' },
    output: {
      path: distDir,
      filename: '[name]',
    },
    devtool,
    stats,
    module: {
      rules: [
        {
          test: /\.scss$/,
          include: join(srcDir, 'css'),
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: { sourceMap: true, importLoaders: 1 },
              },
              // 'postcss-loader',
              'sass-loader',
            ],
          }),
        },
      ],
    },
    plugins: [
      new ExtractTextPlugin('[name].css'),
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { discardComments: { removeAll: true } },
        canPrint: true,
      }),
    ],
  };
  // Webpack configurations
  if (!!env.prod) {
    delete tsBundleConfig.devtool;
    delete tsBundleConfig.devServer;
    tsBundleConfig.stats = 'minimal';
    tsBundleConfig.plugins = [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"',
        },
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
      }),
      new webpack.optimize.UglifyJsPlugin({
        comments: false,
      }),
    ];
  }
  const config = [tsBundleConfig, sassBundleConfigurations];
  return config;
};
