const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude intermediate native build files and compiler directories from Metro watcher
config.resolver.blockList = [
  /[/\\]android[/\\]\.cxx[/\\]/,
  /[/\\]android[/\\]build[/\\]/,
  ...(config.resolver.blockList || [])
];

module.exports = config;
