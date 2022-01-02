/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-18 23:56:49
 * @LastEditTime: 2021-12-25 21:33:22
 * @LastEditors: RGXMG
 * @Description: 发布相关
 */

import path from 'path';
import chalk from 'chalk';
import { publish as createPublish } from '../../utils/createPublish';
import { createConfig } from '../../utils/createConfig';
import { fieldsValidate } from "../../../utils/fieldsValidate";

interface IPublishOptions {
  config: string;
  source: string;
  remote: string;
}

async function publish({ options }: { options: IPublishOptions }) {
  try {
    const { source, config: configPath, remote } = options;
    // 创建配置文件
    const config = createConfig(path.join(process.cwd(), configPath));

    // 验证字段
    fieldsValidate(config, createPublish.configFields);
    // 发布
    const success = await createPublish(config, source);
    success && console.log(chalk.green('已发布！'));
  } catch (error: any) {
    console.log('发布失败：', chalk.red(error.message));
  } finally {
    process.exit();
  }
}

export default publish;