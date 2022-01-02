/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-30 16:32:15
 * @LastEditTime: 2021-12-30 22:28:35
 * @LastEditors: RGXMG
 * @Description:
 */
import path from "path";
import { readJsonFile, updateJsonFile } from "../utils/fileOperator";

export default class Storage {
  // 文件路径
  private filePath: string;
  constructor(filename: string) {
    this.filePath = path.join(process.cwd(), 'storage',`${filename}.json`);
  }

  getItem(name) {
    return readJsonFile(this.filePath)[name];
  }

  setItem(name, value) {
    updateJsonFile(this.filePath, (content) => {
      content[name] = value;
      return content;
    });
  }
}
