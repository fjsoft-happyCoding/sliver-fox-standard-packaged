/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-14 20:45:18
 * @LastEditTime: 2021-12-31 17:34:11
 * @LastEditors: RGXMG
 * @Description: 
 */
const SliverFoxStandardPackaged = require('./build/lib/plugins/standard');
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  plugins: [
    new SliverFoxStandardPackaged({
      files: ['./dist/*.js', './dist/*.exe'],
      outDir: './packaged'
    })
  ]
}