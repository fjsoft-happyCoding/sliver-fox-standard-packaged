#!/usr/bin/env node --max_old_space_size=6144
/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-18 23:36:24
 * @LastEditTime: 2021-12-24 15:29:06
 * @LastEditors: RGXMG
 * @Description:
 */
import { program } from "commander";
import changelog from "../lib/commands/changelog";

export interface IChangelogOptions {
  config: string;
  scope: string;
  register: string;
  secretKey: string;
  append: string;
  wordFilename: string;
  mdFilename: string;
}
program
  .option("--config <config>", "指定packaged.json配置文件")
  .option("--scope <scope>", "指定scope")
  .option("--register <register>", "changelog注册地址")
  .option("--secret <secretKey>", "注册地址访问密匙")
  .option("-w --wordFilename [wordFilename]", "生成word文件，并且指定文件名称，默认为CHANGELOG.doc", "CHANGELOG.doc")
  .option("-a --append", "追加CHANGELOG，指定该项，则会向服务器追加CHANGELOG，并获取最新")
  .option(
    "-m --mdFilename [mdFilename]",
    "生成markdown文件，并且指定文件名称，默认为CHANGELOG.md",
    "CHANGELOG.md"
  )
  .parse(process.argv);


// 默认NODE_ENV为production
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

changelog({
  options: program.opts<IChangelogOptions>(),
});
