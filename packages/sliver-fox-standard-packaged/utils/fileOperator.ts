/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-14 22:50:08
 * @LastEditTime: 2021-12-30 16:41:52
 * @LastEditors: RGXMG
 * @Description: 文件操作
 */
import fs from "fs";
import path from "path";
import hjson from "hjson";
import { json } from "stream/consumers";

/**
 * 更新json文件属性
 * @param filePath
 * @param callback
 */
function updateJsonFile(filePath, callback) {
  let content = hjson.parse(fs.readFileSync(filePath, "utf-8"), {
    keepWsc: true,
  });
  content = callback(content) || content;
  fs.writeFileSync(
    filePath,
    hjson.stringify(content, { keepWsc: true, separator: true, quotes: "all", bracesSameLine: true })
  );
}

/**
 * 阅读json文件
 * @param filePath 
 * @returns 
 */
function readJsonFile(filePath) {
  return hjson.parse(fs.readFileSync(filePath, 'utf-8'));
}

export { updateJsonFile, readJsonFile };
