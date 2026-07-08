const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Tắt strict "package exports" — vài package (vd socket.io-client) import file nội bộ
// (./url.js) không nằm trong exports map, gây lỗi resolve. Dùng resolution cổ điển (main field).
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
