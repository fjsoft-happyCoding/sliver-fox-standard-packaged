/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-19 00:23:53
 * @LastEditTime: 2022-01-08 18:02:06
 * @LastEditors: RGXMG
 * @Description:
 */
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import glob from "glob";

import { createMsg, getDefaultMsg } from "../../utils/createPackagedMsg";
import { createConfig, updateLocalConfigTimes } from "../../utils/createConfig";
import {
  createVersionSymbol,
  createNewVersion,
  updatePackageJsonVersion,
} from "../../utils/createVersion";
import { createChangelog } from "../../utils/createChangelog";
import { IConfig, IPrivateConfig, IPublishConfig } from "../../../types/config";
import { publish } from "../../utils/createPublish";
import {
  writeHtmlContent2Doc,
  convertMd2Html,
} from "../../../utils/contentConvert";
import { gZip } from "../../../utils/zip";

interface IOptions {
  // 打包的文件位置 使用glob匹配
  files: Array<string>;
  // 输出的目录
  outDir: string;
  // 是否发布 默认为false
  noPublish?: Boolean;
}

interface IPackagedInfo {
  // 打包后的目录
  packagedPath: string;
  // 打包后的zip文件的名称
  packagedZipFilename: string;
  // 打包后的zip文件的路径
  packagedZipFilePath: string;
}

interface IContext {
  // 打包相关的信息
  packagedInfo: IPackagedInfo;
  // config配置对象
  config: IConfig;
  // 似有配置对象
  privateConfig: IPrivateConfig;
  // 公共配置对象
  publishConfig: IPublishConfig;
  // 本次创建的changedMsg
  changelogMsg: string;
}

/**
 * 银狐标准打包流程
 * 1. 获取版本号
 * 2. 获取打包msg
 * 3. 在webpack触发done之后进行打包
 * 4. 上传
 */
export default class SliverFoxStandardPackaged {
  // 选项
  private options: IOptions;
  // 配置信息
  private config: null | IConfig = null;
  // 打包相关的信息
  private packagedInfo: null | IPackagedInfo = null;
  // 执行上下文对象
  private context: null | IContext = null;
  constructor(opts: IOptions) {
    this.options = opts;
    this.argumentValidate();
  }

  async onBeforeRunHooks() {
    let success = false;
    // 检查版本号
    success = await this.checkVersion();
    if (!success) process.exit();
    // 初始化
    this.initial();

    // 生成changelog
    success = await this.generatorChangelog();

    if (!success) process.exit();
  }

  async onSliverFoxDoneHooks() {
    try {
      let success = false;
      console.log(chalk.green("\r\n开始处理打包文件："));
      success = await this.startPackaged();
      if (!success) throw new Error();

      // 已打包完成就应该更新打包次数
      updateLocalConfigTimes(this.config as IConfig);

      // 确认发布才进行上传
      if (!this.options.noPublish) {
        console.log(chalk.green("\r\n开始处理发布文件："));
        success = await this.startPublish();
        if (!success) throw new Error();

        console.log(chalk.green("已发布！"));
        // 打包完成
        this.onPackagedDone();
      } else {
        console.log(chalk.green("已处理！"));
      }

      process.exit();
    } catch (error: any) {
      error.message && console.log(error);
      process.exit();
    }
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tapAsync(
      "SliverFoxBeforeRun",
      async (_, callback) => {
        await this.onBeforeRunHooks();
        callback();
      }
    );
    compiler.hooks.done.tap("SliverFoxDone", () => {
      this.onSliverFoxDoneHooks();
    });
  }

  initial() {
    // 获取最新的packaged msg信息
    // 获取当前的配置信息以及版本号
    (this.config as IConfig) = createConfig();
    // 储存打包后相关信息
    (this.packagedInfo as IPackagedInfo) = {
      // 已打包相关资源存放的路径
      packagedPath: path.join(
        this.options.outDir,
        (this.config as IConfig).format
      ),
      // 已打包的zip文件的名称
      packagedZipFilename: "",
      // 已打包的zip文件的文件路径
      packagedZipFilePath: "",
    };
    // 创建context
    const {
      name,
      version,
      format,
      nodeEnv,
      isDevelopment,
      isProduction,
      cwd,
      ...rest
    } = this.config as IConfig;
    this.context = {
      packagedInfo: this.packagedInfo as IPackagedInfo,
      config: this.config as IConfig,
      privateConfig: {
        name,
        version,
        format,
        nodeEnv,
        isDevelopment,
        isProduction,
        cwd,
      },
      publishConfig: rest,
      changelogMsg: "",
    };
  }

  /**
   * 开始打包成压缩文件
   * 1. 匹配文件
   * 2. 移动文件
   * 3. 压缩打包
   */
  async startPackaged(): Promise<boolean> {
    try {
      const root = path.normalize(process.cwd());
      let files: Array<string> = [];
      for (const p of this.options.files) {
        files.push(...glob.sync(path.join(root, p)));
      }
      if (!files.length) {
        throw new Error("无法找到任何可压缩的资源文件，请检查配置项");
      }

      // 复制文件
      for (const f of files) {
        if (fs.statSync(f).isDirectory()) continue;
        fs.moveSync(
          f,
          path.join(
            (this.packagedInfo as IPackagedInfo).packagedPath,
            path.basename(f)
          )
        );
      }

      // 压缩打包
      const filePath = await gZip(
        (this.packagedInfo as IPackagedInfo).packagedPath,
        path.join(
          (this.packagedInfo as IPackagedInfo).packagedPath,
          "../",
          (this.config as IConfig).format
        )
      );
      if (filePath) {
        // 压缩后的名字
        (this.packagedInfo as IPackagedInfo).packagedZipFilename =
          path.basename(filePath);
        (this.packagedInfo as IPackagedInfo).packagedZipFilePath = path.join(
          (this.packagedInfo as IPackagedInfo).packagedPath,
          (this.packagedInfo as IPackagedInfo).packagedZipFilename
        );
        fs.moveSync(
          filePath,
          (this.packagedInfo as IPackagedInfo).packagedZipFilePath
        );
        return true;
      }
      return false;
    } catch (error) {
      console.log("打包失败：", error);
      return false;
    }
  }

  /**
   * 开始发布压缩包
   */
  async startPublish(): Promise<boolean> {
    return await publish(
      this.config as IConfig,
      (this.packagedInfo as IPackagedInfo).packagedZipFilePath
    );
  }

  /**
   * 检查版本号
   */
  async checkVersion(): Promise<boolean> {
    try {
      // 创建版本
      const version = await createNewVersion();
      // 更新版本号到文件中
      updatePackageJsonVersion(version);
      return true;
    } catch (error) {
      console.log("检查版本失败！", error);
      return false;
    }
  }

  /**
   * 生成changelog文件
   * @param callback
   */
  async generatorChangelog(): Promise<boolean> {
    try {
      // 获取changelog的msg
      const msg = await createMsg(
        (this.config as IConfig).version,
        getDefaultMsg(
          (this.config as IConfig).version,
          createVersionSymbol(this.config as IConfig)
        )
      );

      // 赋值
      (this.context as IContext).changelogMsg = msg;

      // 生成changelog文件
      const content = await createChangelog(this.config as IConfig, msg);
      const changelogMdPath = path.join(
        (this.packagedInfo as IPackagedInfo).packagedPath,
        (this.config as IConfig).mdFilename || "changelog.md"
      );

      // 生成文件之前 删除文件夹
      fs.removeSync((this.packagedInfo as IPackagedInfo).packagedPath);

      // 生成changelog的md文件
      fs.ensureFileSync(changelogMdPath);
      fs.writeFileSync(changelogMdPath, content);
      // 生成word文件
      writeHtmlContent2Doc(
        convertMd2Html(content),
        (this.config as IConfig).wordFilename || "changelog.doc",
        (this.packagedInfo as IPackagedInfo).packagedPath
      );
      return true;
    } catch (error) {
      console.log("生成changelog失败！", error);
      return false;
    }
  }

  /**
   * 打包完成
   * 1. 根据配置文件执行逻辑
   */
  onPackagedDone() {
    const { doneConfig } = this.config as IConfig;
    if (doneConfig.console) {
      const {
        changelogMsg,
        packagedInfo: { packagedZipFilename },
      } = this.context as IContext;
      // packagedZipFilename: 打包后的zip文件的名称
      // changelogMsg: 打包时书写的changelog msg
      console.log(
        chalk.white(
          doneConfig.console
            .replace("{changelogMsg}", changelogMsg)
            .replace("{packagedZipFilename}", packagedZipFilename)
        )
      );
    }
  }

  /**
   * 参数校验
   */
  argumentValidate() {
    if (
      !this.options.files ||
      !Array.isArray(this.options.files) ||
      this.options.files.length === 0
    )
      throw new Error(
        "请提供files属性，该属性用于指定需要被打包的资源，使用glob匹配"
      );
    if (!this.options.outDir)
      throw new Error(
        "请提供outDir属性，该属性用于指定打包后存放的资源目录，使用绝对目录"
      );
  }
}
