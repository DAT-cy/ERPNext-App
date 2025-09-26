module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env', // Chỉ sử dụng file .env duy nhất
        allowlist: ['API_URL'],
        safe: false,
        blocklist: null,
        blacklist: null,
      }],
    ],
  };
};