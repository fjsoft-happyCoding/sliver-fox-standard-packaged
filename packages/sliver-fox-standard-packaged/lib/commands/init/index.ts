/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-19 21:25:08
 * @LastEditTime: 2021-12-25 21:33:46
 * @LastEditors: RGXMG
 * @Description: 初始化配置文件
 */
import fs from 'fs-extra';
import path from 'path';
import commandConfig from '../../../config/command';
import chalk from 'chalk';

function init() {
  const content = fs.readFileSync(path.join(__dirname, '../../../config/defaultPackaged.json'));
  fs.writeFileSync(path.join(process.cwd(), commandConfig.configFilename), content);
  console.log(chalk.green(`配置文件：${commandConfig.configFilename}已生成！`));
  process.exit();
}
export {
  init
}