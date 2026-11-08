const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'wasm' to asset extensions so Metro can bundle wa-sqlite.wasm for expo-sqlite on web
config.resolver.assetExts.push('wasm');

module.exports = config;
