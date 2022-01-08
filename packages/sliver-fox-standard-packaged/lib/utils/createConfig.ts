/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-15 17:19:47
 * @LastEditTime: 2021-12-30 22:44:44
 * @LastEditors: RGXMG
 * @Description: 获取配置信息
 */

import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import hjson from "hjson";
import { updateJsonFile, readJsonFile } from "../../utils/fileOperator";
import { IConfig } from "../../types/config.d";
// 默认的配置信息
const defaultConfig: IConfig = parseConfig(
  fs.readFileSync(path.join(__dirname, "../../config/defaultPackaged.json"))
);

const packJsonPath = path.join(process.cwd(), "./package.json");
const localPackagedPath = path.join(process.cwd(), "./packaged.json");

/**
 * 解析config
 * @param content string | Buffer
 * @returns
 */
function parseConfig(content: string | Buffer) {
  return hjson.parse(content.toString());
}

/**
 * 处理format格式化字符串
 * @param {*} format
 * @param {*} dataset
 * @returns
 */
function handleFormatString(format: string, dataset: object) {
  // 将format格式替换成为可用的值
  format = format.replace(/{([^}]+)}/g, (_, key) => {
    return dataset[key] || key;
  });
  return format;
}

/**
 * 获取配置信息
 */
function createConfig(absolutePath: string = localPackagedPath, packagejsonAbsolutedPath: string  = packJsonPath): IConfig {
  // package.json配置
  let packageJson: any = "";
  try {
    packageJson = readJsonFile(packagejsonAbsolutedPath);
  } catch(e: any) {
    console.log(chalk.red("packaged error: failed to load package.json file, please check this file!"));
    throw new Error(e.message);
  }
  const nodeEnv = process.env.NODE_ENV;
  let config: IConfig = {
    ...defaultConfig,
    name: packageJson.name,
    version: packageJson.version,
    nodeEnv: nodeEnv as string,
    cwd: process.cwd(),
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
  };
  try {
    const _config = parseConfig(fs.readFileSync(absolutePath));
    config = { ...config, ..._config };
  } catch (e) {
    throw new Error(
      `在${absolutePath}下未找到配置文件，请检查路径是否正确或者使用 <packaged init> 进行生成！`
    );
  }

  // 格式化
  config.format = handleFormatString(
    config[`format-${process.env.NODE_ENV || "development"}`],
    config
  );
  return config;
}

/**
 * 更新本地config的times
 * @returns
 */
function updateLocalConfigTimes(config: IConfig) {
  try {
    updateJsonFile(localPackagedPath, (d: any) => {
      d.times = config.isProduction ? 1 : Number(d.times) + 1;
      return d;
    });
  } catch (error) {}
}

export { createConfig, updateLocalConfigTimes, parseConfig };
