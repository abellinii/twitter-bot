const path = require('path');module.exports = {
    entry: './config/index.js',
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: 'index.js',
      libraryTarget: 'commonjs2'
    },
    target: 'node',
    mode: 'production'
}