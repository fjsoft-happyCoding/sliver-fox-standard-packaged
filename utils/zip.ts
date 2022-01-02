/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-14 22:44:58
 * @LastEditTime: 2021-12-23 21:42:42
 * @LastEditors: RGXMG
 * @Description: 压缩
 */
import fs from "fs";
import archiver from "archiver";
import recursive from "recursive-readdir";
import chalk from "chalk";
import { createProgress } from "./progress";

function getDirSize(dir) {
  return new Promise((resolve, rej) => {
    recursive(dir, function (err, files) {
      if (err) return rej(err);
      // `files` is an array of file paths
      let total = 0;
      for (const p of files) {
        total += fs.statSync(p).size;
      }
      resolve(total);
    });
  });
}

/**
 * 压缩zip
 * @param {*} input
 * @param {*} output
 * @param {*} totalBytes
 */
function gZip(inputDir, output): Promise<string> {
  // 创建bar
  const bar = createProgress("压缩进度");
  return new Promise(async (resolve, reject) => {
    try {
      // 计算inputDir的文件大小
    const totalSize = Number(await getDirSize(inputDir));

    // 压缩文件的路径
    const zipFilePath = `${output}.zip`;

    // 创建压缩实例
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("progress", function (progress) {
      bar.tick(((progress.fs.processedBytes / totalSize) * 100).toFixed(0));
    });
    archive.on("end", function () {
      console.log(chalk.green(`已压缩：${zipFilePath}`));
      resolve(zipFilePath);
    });
    archive.on("error", function (err) {
      reject(err);
    });

    archive.directory(inputDir, false);
    // 创建输出流
    archive.pipe(fs.createWriteStream(zipFilePath));
    archive.finalize();
    } catch (error) {
      console.log('压缩失败：', error);
    }
  });
}
export { gZip };
