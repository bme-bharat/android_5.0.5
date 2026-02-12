// babel.config.js
module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // ✅ MUST be last
  ],
};
