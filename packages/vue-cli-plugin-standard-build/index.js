#!/usr/bin/env node
/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2022-01-02 21:59:45
 * @LastEditTime: 2022-01-08 19:59:06
 * @LastEditors: RGXMG
 * @Description: vue-cli插件, 用于标准打包
 */
const SliverFoxStandardPackaged =
  require("@fjsoft/sliver-fox-standard-packaged").default;

module.exports = (api, options) => {
  api.registerCommand(
    "electron:build:standard",
    {
      description: "provide a standard build app with electron-builder",
      usage: "vue-cli-service standard-build",
    },
    function (...args) {
      return new Promise(async (resolve, reject) => {
        // 检查配置参数
        if (!options.pluginOptions || !options.pluginOptions.standardPackaged) {
          throw new Error(
            "the `pluginOptions.standardPackaged` configuration cannot be empty！"
          );
        }
        // 初始化插件
        const sliverFoxStandardPackaged = new SliverFoxStandardPackaged(
          options.pluginOptions.standardPackaged
        );
        // 检查版本号
        await sliverFoxStandardPackaged.onBeforeRunHooks();
        // 检查是否需要publish
        args[1].forEach((i, $i) => {
          if (i === "--no-publish") {
            sliverFoxStandardPackaged.options.noPublish = true;
            args[1].splice($i, 1);
          }
        });

        // 尝试修改options
        const artifactName = sliverFoxStandardPackaged.config.format + ".exe";
        if (!options.pluginOptions.electronBuilder) {
          options.pluginOptions.electronBuilder = {
            builderOptions: {
              nsis: {
                artifactName,
              },
            },
          };
        } else if (!options.pluginOptions.electronBuilder.builderOptions) {
          options.pluginOptions.electronBuilder.builderOptions = {
            nsis: {
              artifactName,
            },
          };
        } else if (!options.pluginOptions.electronBuilder.builderOptions.nsis) {
          options.pluginOptions.electronBuilder.builderOptions.nsis = {
            ...options.pluginOptions.electronBuilder.builderOptions,
            artifactName,
          };
        } else {
          options.pluginOptions.electronBuilder.builderOptions.nsis.artifactName =
            sliverFoxStandardPackaged.config.format + ".exe";
        }

        // 注入环境变量
        api.chainWebpack((config) => {
          // 增加process变量process.env.VERSION_FORMAT = sliverFoxStandardPackaged.config.format;
          // 增加process变量process.env.VERSION = sliverFoxStandardPackaged.config.version;
          const VERSION_FORMAT = `"${sliverFoxStandardPackaged.config.format}"`;
          const VERSION = `"${sliverFoxStandardPackaged.config.version}"`;
          if (config.plugins.has("define")) {
            config.plugin("define").tap((args) => {
              args[0]["process.env"].VERSION_FORMAT = VERSION_FORMAT;
              args[0]["process.env"].VERSION = VERSION;
              return args;
            });
          } else {
            config.plugin("define").use(DefinePlugin, [
              {
                "process.env": {
                  VERSION_FORMAT,
                  VERSION,
                },
              },
            ]);
          }
        });

        // 覆盖electron:build服务
        const { commands } = api.service;
        const serve = commands["electron:build"];
        const serveFn = serve.fn;
        // 覆盖
        serve.fn = (...args) => {
          return serveFn(...args).then(() => {
            resolve(sliverFoxStandardPackaged.onSliverFoxDoneHooks());
          });
        };
        return api.service.run("electron:build", ...args);
      });
    }
  );
};
