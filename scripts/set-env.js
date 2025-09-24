#!/usr/bin/env node
/**
 * Script để thay đổi môi trường trong file .env
 * Usage: npm run env:dev hoặc npm run env:prod
 */

const fs = require('fs');
const path = require('path');

const envArg = process.argv[2];
const validEnvs = ['development', 'production'];

if (!envArg || !validEnvs.includes(envArg)) {
  console.log('❌ Vui lòng chỉ định môi trường hợp lệ:');
  console.log('   npm run env:dev');
  console.log('   npm run env:prod');
  process.exit(1);
}

const envFilePath = path.join(__dirname, '..', '.env');
const newContent = `ENV_MODE=${envArg}\n`;

try {
  fs.writeFileSync(envFilePath, newContent, 'utf8');
  console.log(`✅ Đã chuyển môi trường sang: ${envArg}`);
  console.log(`📝 App sẽ sử dụng config từ: .env.${envArg}`);
} catch (error) {
  console.error('❌ Lỗi khi ghi file .env:', error.message);
  process.exit(1);
}