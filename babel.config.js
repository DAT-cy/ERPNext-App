module.exports = function (api) {
  api.cache(true);
  const envFile = process.env.ENVFILE || '.env'; // cho phép chọn file env khác
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: envFile,                 // <--- mặc định đọc .env, có thể override bằng ENVFILE
        allowlist: ['API_URL'],        // <--- chỉ cho phép các biến này
        safe: false,                   // bật true nếu muốn bắt buộc .env.example
        blocklist: null,
        blacklist: null,               // alias cũ
      }],
    ],
  };
};
