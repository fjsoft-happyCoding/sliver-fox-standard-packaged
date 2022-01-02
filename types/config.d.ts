/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-19 15:03:25
 * @LastEditTime: 2021-12-30 21:46:22
 * @LastEditors: RGXMG
 * @Description:
 */

export interface IPrivateConfig {
  // 项目名称
  name: string;
  // 版本号
  version: string;
  // 格式化字符串
  format: string;
  // 执行路径
  cwd: string;
  // 当前执行环境
  nodeEnv: string;
  // 是否为正式环境
  isProduction: boolean
  // 是否为开发环境
  isDevelopment: boolean;
}

export interface IPublishConfig {
  // 创建者 默认无名氏，如：小明 xm
  creator: string;
  // 属于那个项目，如： 北京 bj
  scope: string;
  // 属性名 特定标识的属性
  property: string;
  // 打包的次数，每次打包完成后会在此基础上加1
  times: number;
  // development环境下的格式化字符串
  // 可引用如下字段：
  // name：项目名称，来源于package.json
  // version：项目版本号，来源于package.json
  // property：属性名，来源自定义属性配置
  // scope：项目所属，来源自定义属性配置
  // creator：创建者，来源自定义属性配置
  // times：打包的次数，来源自定义属性配置
  "format-development": string;
  // production环境下的格式化字符串
  // name：项目名称，来源于package.json
  // version：项目版本号，来源于package.json
  // property：属性名，来源自定义属性配置
  // scope：项目所属，来源自定义属性配置
  // creator：创建者，来源自定义属性配置
  // times：打包的次数，来源自定义属性配置
  "format-production": string;
  // markdown文件的名称
  mdFilename: string;
  // word文件的名称
  wordFilename: string;
  // 此次打包存放的资源文件夹
  packagedPath: string;
  // changelog配置信息 用于提供服务器对changelog记录的能力
  // 不配置则表示不需要服务器功能
  // 服务器需要支持restful接口
  // 提供 read/create/append/backup/delete/clear 接口功能
  changelogConfig: {
    // 服务器注册地址
    register: string;
    // 服务器接口访问秘钥
    secretKey: string;
  };
  // 发布配置
  // 不配置则表示不需要发布功能
  // 用于保存安装包
  // 程序会根据配置信息进行自动上传
  // 使用ftp协议，暂时只支持用户名/密码模式，不支持免密登陆
  publishConfig: {
    // 地址：端口
    host: string;
    port: number;
    // 登录名
    username: string;
    // 密码
    password: string;
    // 存放地址
    rootPath: string;
  };
  // 完成packaged之后的的配置
  doneConfig: {
    // 完成之后进行打印的内容
    // 可引用下列字段：
    // packagedZipFilename: 打包后的zip文件的名称
    // changelogMsg: 打包时书写的changelog msg
    console: string;
  };
}

export interface IConfig extends IPrivateConfig, IPublishConfig{}
