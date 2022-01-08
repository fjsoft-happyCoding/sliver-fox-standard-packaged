# 插件目的

- 规范化提交，用于统一整个前端的发布流程，增加确认版本号、书写打包信息、生成word/markdown文档、压缩文件、自动上传、生成打包通知信息等；
- 规范化文档结构，全部采用markdown进行编写打包信息，并自动记录每次打包信息，做到每次生成正式版的时候生成完整的CHANGELOG文档；
- 规范化版本号管理，与【前端版本号管理方案v1.0.0】相结合，将正式环境下与测试环境下的整个前端版本号自动化处理；

# 插件基本信息

## 名称
`@fjsoft/sliver-fox-standard-packaged`

## 命令行包含
- `packaged`

## 安装方式
`推荐使用本地安装`

# 插件工作流程

## 1. 交互本地构建的版本号 
> 在这一步即确定当前打包的版本号是多少；

- 钩子回调：`hooks.beforeRun`
- 版本号规则：满足 `x.y.z`
- 默认值：取自当前package.json中的version，**回车键使用默认值，即不更改当前版本号**

### 提示信息
**?请输入本次构建的版本号(输入的版本号会同步更新到package.json中)：**

## 2. 交互本地构建的信息
> 在这一步既是书写构建信息；

- 文档格式：使用markdown格式文本进行书写
- 文档规则：头部不能修改，至少包含一个`fixed`或者`feat`

### 提示信息
**?packaged message: Press <enter> to launch your preferred editor.**

### 例子

```md
##### BQFJHIT v0.60.0 Chunk Test Version (2022.01.05 11:47:17)

###### fixed:
1. 【Bug#672】解决...问题；
2. 【Bug#672】解决...问题；
3. 【Bug#672】解决...问题；
```

### 注意事项：

1. 确保头部版本号以#####开头，且最好不更改；
2. 至少包含一个`fixed`或者`feat`，对于不需要的`fixed`或者`feat`请删除

## 3. webpack进行打包
> 该过程为webpack自动打包过程


## 5. 生成changelog文件以及word文件
> 根据环境(process.env.NODE_ENV)生成对应markdown文件以及word文件

- 开发环境，即process.env.NODE_ENV === development时：只生成本地的changelog文件信息，不从服务器拉取信息；
- 生产环境，即process.env.NODE_ENV === production时：会向服务器发送并且拉取changelog文件信息；

## 4. 进行文件的合并与压缩
> 该过程即是通过压缩手段把打包后的exe文件以及生成的changelog等文件压缩成一个压缩包

- 钩子回调：`hooks.done`
- 存放目录：多个文件会存放在`项目根目录的packaged`中；
- 压缩格式：使用zip压缩，压缩包内包含exe可执行文件、md文件、word文件等；

## 5. 文件的发布
> 该过程即是文件上传到ftp服务器

# 命令介绍

- 名称：`packaged` / `npx packaged`
- 查看介绍：`packaged help`

### init
> 生成packaged.json配置文件，如果packaged.json已存在，则默认失败

#### 使用场景
1. 首次使用该插件，用于生成基本配置文件时


### publish [options]
> 用于发布文件到ftp服务器上

#### 使用场景
1. 当打包构建中自动上传出错，需要再次手动上传时；

### changelog
> changelog日志的操作

#### 使用场景
1. 用于生成当前项目

**生成packaged.json配置文件，如果packaged.json已存在，则默认失败**

# 插件配置
```js
{
  // 创建者 默认无名氏，如：小明 xm
  "creator": "xm",
  // 项目所属，如： 北京 bj
  // 该scope用于标识changelog划分
  // 每个项目都必须保持不一致
  "scope": "cq",
  // 属性名 特定标识的属性
  "property": "Setup",
  // 打包的次数
  // 在development下每次打包完成后会在此基础上加1
  // 当在production环境下打包一次后，该值会被重置为1
  "times": 1,
  // development环境下的版本格式化字符串
  // 用于版本标识字段以及打包压缩文件标识字段
  // 可引用如下字段：
  // name：项目名称，来源于package.json 
  // version：项目版本号，来源于package.json 
  // property：属性名，来源自定义属性配置
  // scope：项目所属，来源自定义属性配置
  // creator：创建者，来源自定义属性配置
  // times：打包的次数，来源自定义属性配置
  "format-development": "{name} {property} {version}-{scope}-{creator}-devtools-{times}",
  // production环境下的格式化字符串
  // 用于版本标识字段以及打包压缩文件标识字段
  // name：项目名称，来源于package.json 
  // version：项目版本号，来源于package.json 
  // property：属性名，来源自定义属性配置
  // scope：项目所属，来源自定义属性配置
  // creator：创建者，来源自定义属性配置
  // times：打包的次数，来源自定义属性配置
  "format-production": "{name} {property} {version}",
  // 打包后根据changelog所生成的markdown文件的名称
  "mdFilename": "CHANGELOG.md",
  // 打包后根据changelog所生成的word文件的名称
  "wordFilename": "ReleaseNote.doc",
  // changelog配置信息 用于提供服务器对changelog记录的能力
  // 在production环境下生效，development环境下不执行该配置
  // 不配置则表示不需要服务器功能
  // 服务器需要支持restful接口
  // 提供 read/create/append/backup/delete/clear 接口功能
  "changelogConfig": {
    // 服务器注册地址
    "register": "http://localhost",
    // 服务器接口访问秘钥
    "secretKey": "111"
  },
  // 发布配置
  // 不配置则表示不需要发布功能
  // 用于保存安装包
  // 程序会根据配置信息进行自动上传
  // 使用ftp协议，暂时只支持用户名/密码模式，不支持ssh等免密登陆
  "publishConfig": {
    // 地址
    "host": "1.1.1.1",
    // 端口
    "port": 221,
    // 登录名
    "username": "name",
    // 密码
    "password": "123123",
    // 存放的地址
    "rootPath": "/北京风险管控局/"
  },
  // 完成packaged之后的的配置
  "doneConfig": {
    // 完成之后进行打印的内容
    // 可引用下列字段：
    // packagedZipFilename: 打包后的zip文件的名称
    // changelogMsg: 打包时书写的changelog msg
    "console": "北京风险管控局{packagedZipFilename}版本文件已上传!！\r\n修改如下(详细内容请查阅压缩包内文档描述)：\r\n{changelogMsg}"
  }
}
```

# 内部开发人员使用
> 上述文档只是简要描述情况，具体使用细节，内部沟通；

1. 更新项目代码后，更改`packaged.json`文件中的`creator`为自己名字得简称，如 `段意莲`；
   ```js
   "creator": "dyl",
   ```
2. 提交代码时，不勾选 `packaged.json` 文件；