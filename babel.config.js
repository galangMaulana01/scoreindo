module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // react-native-reanimated/plugin TIDAK perlu ditambah manual
      // karena Reanimated v4 (react-native-worklets) sudah include sendiri
    ],
  };
};