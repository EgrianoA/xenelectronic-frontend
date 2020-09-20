require('dotenv').config();

const path = require('path');
const Dotenv = require('dotenv-webpack');
const withSass = require('@zeit/next-sass');
const webpack = require('webpack')
const assetPrefix = '/'

module.exports = withSass({
  devIndicators: {
    autoPrerender: false
  },
  webpack: config => {
    config.plugins = config.plugins || [];
    config.plugins = [
      ...config.plugins,

      new Dotenv({
        path: path.join(__dirname, '.env'),
        systemvars: true
      }),
      new webpack.DefinePlugin({
        'process.env.ASSET_PREFIX': JSON.stringify(assetPrefix),
      }),
    ];
    return config;
  },
  exportPathMap: () => ({
    '/': { page: '/' },
  }),
  assetPrefix: assetPrefix,
});
