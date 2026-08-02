// The source code including full typescript support is available at:
// https://github.com/shakacode/react-on-rails-demo-ssr-hmr/blob/master/config/webpack/clientWebpackConfig.js

const loadablePluginModule = require('@loadable/webpack-plugin');
const LoadablePlugin = loadablePluginModule.default || loadablePluginModule;
const commonWebpackConfig = require('./commonWebpackConfig');

const configureClient = () => {
  const clientConfig = commonWebpackConfig();

  // server-bundle is special and should ONLY be built by the serverConfig
  // In case this entry is not deleted, a very strange "window" not found
  // error shows referring to window["webpackJsonp"]. That is because the
  // client config is going to try to load chunks.
  delete clientConfig.entry['server-bundle'];

  // Emit loadable-stats.json so the SSR renderer can resolve code-split chunks.
  // It is copied to the renderer via ReactOnRailsPro assets_to_copy.
  clientConfig.plugins.push(new LoadablePlugin({ filename: 'loadable-stats.json', writeToDisk: true }));

  return clientConfig;
};

module.exports = configureClient;
