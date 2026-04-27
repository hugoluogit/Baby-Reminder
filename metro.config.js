// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 禁用 lazy bundling（Expo Router 功能，不使用時會導致 HMR 問題）
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: false,
};

module.exports = config;
