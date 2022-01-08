/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-26 22:07:43
 * @LastEditTime: 2022-01-02 16:52:59
 * @LastEditors: RGXMG
 * @Description: 用于复制文件
 */
const fs = require("fs-extra");
const path = require("path");
const cwd = process.cwd();
const packJson = require(path.join(cwd, "./package.json"));
const reg = /[^ts]$/;

function recurDir(copyFrom, copyTo, includeDir) {
  // 遍历dir的信息
  for (const fromItem of fs.readdirSync(copyFrom)) {
    // 只复制允许复制的文件夹
    if (includeDir && !includeDir.includes(fromItem)) continue;
    
    // 创建定infoItem的绝对路径 用于读取信息
    const fromItemAbsolutePath = path.join(copyFrom, fromItem);
    const stat = fs.statSync(fromItemAbsolutePath);

    // 复制文件夹
    if (stat.isDirectory(fromItemAbsolutePath)) {
      const copyToChanged = path.join(copyTo, fromItem);
      copyDir(copyToChanged);
      recurDir(fromItemAbsolutePath, copyToChanged);
      continue;
    }

    // 复制文件
    if (reg.test(path.basename(fromItemAbsolutePath))) {
      copyFile(fromItemAbsolutePath, copyTo);
    }
  }
}

function copyFile(filePath, targetPath) {
  fs.copyFileSync(filePath, path.join(targetPath, path.basename(filePath)));
}

function copyDir(createDir) {
  fs.ensureDir(createDir);
}

recurDir(cwd, path.join(cwd, "./build"), packJson.files);
