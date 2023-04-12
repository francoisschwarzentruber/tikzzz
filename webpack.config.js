const path = require('path');

module.exports = {
  entry: './js/main.js',
  mode: 'development',
  output: {
    filename: 'bundle.js'
  },
  resolve: {
    // ...
    fallback: {
      // 👇️👇️👇️ add this 👇️👇️👇️
      "fs": false,
      "os": false,
      "path": false,
    }
  }
};
