#!/usr/bin/env node --max_old_space_size=6144
/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-18 23:36:07
 * @LastEditTime: 2021-12-25 21:26:10
 * @LastEditors: RGXMG
 * @Description:
 */
import { program } from "commander";
import publish from "../lib/commands/publish";
import config from "../config/command";

interface IPublishOptions {
  config: string;
  source: string;
  remote: string;
}

program
  .requiredOption(
    "--config <config>",
    "指定packaged配置文件的相对路径",
    config.configFilename
  )
  .requiredOption("-s --source <source>", "指定需要发布的单文件的相对路径, 默认会将该文件发往远端路径{配置文件的rootPath}/{package.json中的version}/{path.basename(source)}下")
  .parse(process.argv);
 
publish({
  options: program.opts<IPublishOptions>(),
});
