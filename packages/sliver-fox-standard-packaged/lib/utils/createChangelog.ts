/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-18 23:06:52
 * @LastEditTime: 2021-12-30 22:58:03
 * @LastEditors: RGXMG
 * @Description: 服务端交互
 */

import axios from "axios";
import { TFields } from "../../utils/fieldsValidate";
import { IConfig } from "../../types/config";

const api = "/changelog";

interface IServiceResponse {
  code: number;
  msg: string;
  [propName: string]: any;
}

// service通用配置type

export type TServiceCommonConfig = Pick<
  IConfig,
  "scope" | "changelogConfig" | "mdFilename" | "wordFilename" | "isDevelopment"
>;

/**
 * 生成changelog
 * @param config
 * @returns
 */
function getChangelog(config: TServiceCommonConfig) {
  // 获取最新的changelog
  return axios({
    url: config.changelogConfig.register + api,
    method: "get",
    params: {
      scope: config.scope,
      secretKey: config.changelogConfig.secretKey,
    },
  }).then(({ data }) => {
    try {
      if (data.code === 200) {
        return data.data.content || "";
      }
      throw new Error(data.msg);
    } catch (error: any) {
      throw new Error("服务端错误，请确实配置信息正确：" + error.message);
    }
  });
}
// config文件的检查
getChangelog.configFields = [
  { changelogConfig: ["register", "secretKey"] },
  "scope",
] as TFields;

/**
 * 创建changelog
 * 1. 判断是否开启了服务端支持，没有开启，直接返回appendMsg
 * @param config
 * @param appendMsg
 */
function createChangelog(config: TServiceCommonConfig, appendMsg) {
  if (config.isDevelopment || !config.changelogConfig)
    return appendMsg;
  // 获取最新的changelog
  return axios
    .patch<any, IServiceResponse>(config.changelogConfig.register + api, {
      scope: config.scope,
      content: appendMsg,
      secretKey: config.changelogConfig.secretKey,
    })
    .then(({ data }) => {
      try {
        if (data.code === 200) {
          return data.data.content || "";
        }
        throw new Error(data.msg);
      } catch (error: any) {
        throw new Error("服务端错误，请确实配置信息正确：" + error.message);
      }
    });
}
// config文件的检查
createChangelog.configFields = [
  { changelogConfig: ["register", "secretKey"] },
  "scope",
] as TFields;

export { createChangelog, getChangelog };
