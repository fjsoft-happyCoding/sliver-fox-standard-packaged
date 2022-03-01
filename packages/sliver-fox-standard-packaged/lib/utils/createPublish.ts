/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-19 20:17:33
 * @LastEditTime: 2022-03-01 22:33:21
 * @LastEditors: RGXMG
 * @Description:
 */
import fs from "fs";
import { Client } from "basic-ftp";
import chalk from "chalk";
import path from "path";
import inquirer from "inquirer";
import { IConfig } from "../../types/config";
import { createProgress } from "../../utils/progress";

/**
 * 获取文件大小
 * @param filepath
 * @returns
 */
function getFileSize(config: IConfig, filepath) {
  try {
    return fs.statSync(path.join(config.cwd, filepath)).size;
  } catch (error) {
    return 0;
  }
}

/**
 * 检查文件是否已存在
 * @param client
 * @param path
 */
async function checkFileIsExisted(client: Client, filepath: string) {
  try {
    // 获取文件信息
    const list = await client.list(filepath);
    if (!list || !list.length) return true;
    const fileInfo = list[0];

    // 发布询问
    const answer = await inquirer.prompt({
      type: "confirm",
      name: "question",
      message: chalk.yellow(
        `文件${chalk.red(path.join(filepath, fileInfo.name))}(${
          fileInfo.rawModifiedAt
        })已存在，${chalk.red.bold("继续发布将会覆盖该文件")}，是否继续发布？`
      ),
    });
    return answer.question;
  } catch (error: any) {
    return true;
  }
}

/**
 * 发布文件
 * @param config
 * @param filepath
 */
async function publish(config: IConfig, filepath: string): Promise<boolean> {
  let client: Client | null = null;
  try {
    // 计算文件大小
    const totalSize = getFileSize(config, filepath);
    if (!totalSize) {
      throw new Error("未找到文件：" + filepath);
    }
    client = new Client();
    // 打印提示
    // client.ftp.verbose = true;

    let { host, port, username, password, rootPath } = config.publishConfig;
    await client.access({
      host,
      port,
      user: username,
      password,
    });

    // 处理rootPath
    rootPath = rootPath.startsWith("/") ? rootPath : `/${rootPath}`;
    // 处理version
    const version = config.version.toLocaleLowerCase().startsWith("v")
      ? config.version
      : `v${config.version}`;

    // 创建文件夹
    await client.ensureDir(path.join(rootPath, version));
    // 创建远程路径
    const toRemotePath = path.join(rootPath, version, path.basename(filepath));
    // 验证路劲覆盖问题
    const pass = await checkFileIsExisted(client, toRemotePath);

    // 通过则继续上传
    if (pass) {
      // 创建progress
      console.log(chalk.green(`${filepath} => ${toRemotePath}`));
      const bar = createProgress("发布进度");
      client.trackProgress((info) => {
        bar.tick(((info.bytes / totalSize) * 100).toFixed(0));
      });
      await client.uploadFrom(filepath, toRemotePath);
    } else {
      console.log(chalk.red("用户取消上传！"));
      return false;
    }
    // 关闭
    client.close();
    return true;
  } catch (err) {
    // 释放资源
    console.log("发布失败：", err);
    client?.close?.();

    // 询问是否再次上传
    const answer = await inquirer.prompt({
      type: "confirm",
      name: "question",
      message: chalk.red(
        '文件发布失败，是否再次尝试发布？'
      ),
    });
    if (answer.question) return publish(config, filepath);

    return false;
  }
}
// config文件的检查
publish.configFields = [
  { publishConfig: ["host", "port", "username", "password", "rootPath"] },
];

export { publish };
