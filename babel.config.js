module.exports = function (api) {
  api.cache(true);
  
  // Đọc môi trường từ file .env trước
  require('dotenv').config({ path: '.env' });
  
  // Tự động chọn file config theo ENV_MODE từ .env
  let envFile = process.env.ENVFILE; // Cho phép override thủ công
  
  if (!envFile) {
    const envMode = process.env.ENV_MODE || 'development';
    envFile = `.env.${envMode}`;
  }
  
  console.log(`🔧 Environment Mode: ${process.env.ENV_MODE}`);
  console.log(`🔧 Loading config from: ${envFile}`);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: envFile,
        allowlist: ['ENV_MODE', 'API_URL'],
        safe: false,
        blocklist: null,
        blacklist: null,
      }],
    ],
  };
};
