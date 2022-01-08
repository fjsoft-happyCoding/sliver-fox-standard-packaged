/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-14 22:50:08
 * @LastEditTime: 2021-12-20 22:25:53
 * @LastEditors: RGXMG
 * @Description:
 */
import { marked } from "marked";
import fs from "fs-extra";
import path from "path";

/**
 * 将html内容写入content
 * @param {*} content
 * @param {*} filename
 * @param {*} path
 * @returns
 */
function writeHtmlContent2Doc(
  content: string,
  filename: string,
  fullPath: string
) {
  return fs.writeFile(
    path.join(fullPath, `./${filename}`),
    fs
      .readFileSync(path.join(__dirname, "../config/wordHtmlTpl.html"))
      .toString()
      .replace("replace_area", content)
  );
}

/**
 * 将markdown字符串文件转为html
 * @param {*} string
 */
function convertMd2Html(string) {
  return marked(string);
}

export { writeHtmlContent2Doc, convertMd2Html };
