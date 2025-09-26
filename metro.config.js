// metro.config.js
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);

  return mergeConfig(defaultConfig, {
    transformer: {
      babelTransformerPath: require.resolve("react-native-svg-transformer"),
    },
    resolver: {
      // keep all default assetExts, but remove "svg"
      assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== "svg"),
      // keep all default sourceExts, and add "svg"
      sourceExts: [...defaultConfig.resolver.sourceExts, "svg"],
    },
  });
})();
