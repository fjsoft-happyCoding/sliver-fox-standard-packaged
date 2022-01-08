/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-18 23:49:42
 * @LastEditTime: 2021-12-30 22:22:21
 * @LastEditors: RGXMG
 * @Description:
 */
import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import {
  getChangelog,
  TServiceCommonConfig,
  createChangelog,
} from "../../utils/createChangelog";
import {
  convertMd2Html,
  writeHtmlContent2Doc,
} from "../../../utils/contentConvert";
import { createConfig } from "../../utils/createConfig";
import { IChangelogOptions } from "../../../bin/packaged-changelog";
import { createMsg, getDefaultMsg } from "../../utils/createPackagedMsg";
import { fieldsValidate } from "../../../utils/fieldsValidate";
import { IConfig } from "types/config";

/**
 * 生成changelog文件
 * 尝试生成md文件
 *  尝试生成word文件
 * @param options
 * @param content
 */
function generatorChangelogFile(
  { mdFilename, wordFilename }: IChangelogOptions,
  content: string
) {
  const rootPath = process.cwd();
  if (mdFilename) {
    fs.writeFileSync(
      path.join(rootPath, mdFilename || "CHANGELOG.md"),
      content
    );
    console.log(chalk.green("已生成markdown文件，位置位于：./", mdFilename));
  }
  if (wordFilename) {
    console.log(chalk.green("已生成word文件，位置位于：./", wordFilename));
  }
  writeHtmlContent2Doc(convertMd2Html(content), wordFilename, rootPath);
}

/**
 * 处理options与config的合并
 * @param config
 * @param options
 */
function handleOptionsMergeConfig(
  config: IConfig,
  options: TServiceCommonConfig
): TServiceCommonConfig {
  if (!options.mdFilename) options.mdFilename = config.mdFilename;
  if (!options.wordFilename) options.wordFilename = config.wordFilename;
  if (!options.scope) options.scope = config.scope;
  if (!options.wordFilename) options.wordFilename = config.wordFilename;
  if (!options.changelogConfig.register)
    options.changelogConfig.register = config.changelogConfig.register;
  if (!options.changelogConfig.secretKey)
    options.changelogConfig.secretKey = config.changelogConfig.secretKey;
  return options;
}

/**
 * changelog处理
 * 1. append还是get
 * 2. 尝试生成md文件
 * 3. 尝试生成word文件
 * @param param0
 */
async function changelog({ options }: { options: IChangelogOptions }) {
  try {
    // 配置信息
    let serviceCommonConfig: TServiceCommonConfig = {
      scope: options.scope,
      mdFilename: options.mdFilename,
      wordFilename: options.wordFilename,
      isDevelopment: false,
      changelogConfig: {
        register: options.register,
        secretKey: options.secretKey,
      },
    };

    let config: IConfig | null = null;

    // 处理配置文件
    if (options.config) {
      config = createConfig(path.join(process.cwd(), options.config));
      serviceCommonConfig = handleOptionsMergeConfig(
        config as IConfig,
        serviceCommonConfig
      );
    }

    const currentConfig: TServiceCommonConfig &
      Pick<IConfig, "version" | "format"> = {
      version: (config as IConfig).version,
      format: (config as IConfig).format,
      ...serviceCommonConfig,
    };

    // 字段验证
    fieldsValidate(serviceCommonConfig, getChangelog.configFields);

    // 获取还是append changelog
    let content = "";
    if ("append" in options) {
      content = await createMsg(
        currentConfig.version,
        getDefaultMsg(currentConfig.version, currentConfig.format)
      );
      fieldsValidate(currentConfig, createChangelog.configFields);
      content = await createChangelog(currentConfig, content);
    } else {
      content = await getChangelog(currentConfig);
    }

    if (!content) {
      console.log(chalk.yellow("获取到的changelog为空==="));
    }
    // 生成changelog文件
    generatorChangelogFile(options, content || "");
  } catch (error: any) {
    console.log(chalk.red(error.message));
  } finally {
    process.exit();
  }
}

export default changelog;
