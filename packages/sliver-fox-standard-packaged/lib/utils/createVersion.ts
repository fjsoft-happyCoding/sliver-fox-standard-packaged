/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-15 17:16:09
 * @LastEditTime: 2022-01-04 21:03:29
 * @LastEditors: RGXMG
 * @Description: 获取版本
 */

import inquirer from "inquirer";
import path from "path";
import chalk from "chalk";
import { getDate } from "../../utils/date";
import { updateJsonFile } from "../../utils/fileOperator";
import { IConfig } from "../../types/config";

function getPackageJsonVersion() {
  return require(path.join(process.cwd(), "package.json")).version;
}

/**
 * 验证版本号
 * @param version
 */
function validateVersion(version: string) {
  return /^\d+\.\d+\.\d+$/.test(version);
}

/**
 * 更新package.json中的版本号
 * @param version
 * @returns
 */
function updatePackageJsonVersion(version) {
  if (!validateVersion(version)) return false;
  const jsonPath = path.join(process.cwd(), "package.json");
  updateJsonFile(jsonPath, (d: any) => {
    d.version = version;
    return d;
  });
}

/**
 * 创建新的版本输入
 */
async function createNewVersion(version: string = getPackageJsonVersion()) {
  // 发布询问
  let answer = await inquirer.prompt({
    type: "input",
    name: "question",
    message: chalk.green(
      `请输入本次构建的版本号(输入的版本号会同步更新到package.json中)`
    ),
    default: version,
  });
  if (!validateVersion(answer.question)) {
    console.log(
      chalk.red(`版本号：${answer.question} 不合法，请输入 x.x.x 格式的版本号`)
    );
    answer.question = await createNewVersion(version);
  }
  return answer.question;
}
createNewVersion.configFields = ["version"];

/**
 * 根据配置信息获取版本标识
 * @param {*} config
 */
function createVersionSymbol(config: IConfig) {
  return `${config.name} v${config.version} ${
    config.isProduction ? "Release" : "Chunk Test"
  } Version (${getDate()})`;
}
createVersionSymbol.configFields = ["version"];

export { createVersionSymbol, createNewVersion, updatePackageJsonVersion };
