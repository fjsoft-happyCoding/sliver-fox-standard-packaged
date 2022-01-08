/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-14 22:35:30
 * @LastEditTime: 2021-12-30 22:30:08
 * @LastEditors: RGXMG
 * @Description: 获取打包信息
 */
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import Storage from "../../storage";

// 创建storage
const storage = new Storage("versionMsgMap");

/**
 * 验证msg符不符合规范
 * 规范如下：
 * 1. 必须包含4级标题 ####
 * 2. 必须包含feature和fixed其一 ######
 *
 * ##### V0.0.1 Release Version (2021.12.8)
 * ###### feature:
 * - 新功能1
 * - 新功能2
 * ###### fixed:
 * - 修复问题1
 * - 修复问题2
 * @param {string} msg
 */
function validateMsg(msg) {
  try {
    if (~msg.indexOf("{VERSION}"))
      return "message不合法：请将{VERSION}替换为具体的版本号，如：v1.0.0";
    if (!msg.startsWith("#####"))
      return "message不合法：必须以5级标题开头！开头不能存在空格或者换行！请修改！";
    if (!~msg.indexOf("feature") && !~msg.indexOf("fixed"))
      return "message不合法：必须包含feature或者fixed内容！请修改！";
    return null;
  } catch (error) {
    throw new Error("message不合法");
  }
}

/**
 * 获取默认msg
 * 1. 尝试根据当前的package.json的版本号去storage寻找
 * 2. 读取本地默认msg
 * @param versionSymbol
 */
function getDefaultMsg(version, versionSymbol) {
  // 尝试根据version获取storage的msg内容
  let msg = "";
  if (version) {
    if (storage.getItem("version") === version) {
      msg = storage.getItem("msg");
      if (msg.length > 10) return msg;
    }
  }
  // 获取当前打包的msg
  msg = fs
    .readFileSync(path.join(__dirname, "../../config/defaultMsg.md"), "utf-8")
    .toString();

  // version版本的symbol
  versionSymbol && (msg = msg.replace("{VERSION}", versionSymbol));

  return msg;
}

/**
 * 获取信息
 * @returns
 */
function createMsg(
  version,
  defaultMsg: string = "",
  msg?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    inquirer
      .prompt([
        {
          type: "editor",
          name: "choice",
          message: msg || "packaged message:",
          default: defaultMsg,
        },
      ])
      .then(({ choice }) => {
        const errorMsg = validateMsg(choice);
        if (errorMsg) return resolve(createMsg(version, choice, errorMsg));

        // 保存到storage中
        storage.setItem("version", version);
        storage.setItem("msg", choice);

        return resolve(choice);
      })
      .catch((error) => {
        reject(error);
        if (error.isTtyError) {
          console.error(
            "Prompt couldn't be rendered in the current environment"
          );
        } else {
          console.error("Something else went wrong");
        }
      });
  });
}

export { createMsg, getDefaultMsg, validateMsg };
