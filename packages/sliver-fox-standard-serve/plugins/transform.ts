/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2022-01-30 17:36:56
 * @LastEditTime: 2022-01-31 17:41:43
 * @LastEditors: RGXMG
 * @Description: 转换
 */
import * as babel from "@babel/core";
import * as types from "@babel/types";
import uuid from "../utils/uuid";
import { staticPathSuffix }  from '../config/static';



/**
 * 转换process.end语法为import.meta.env
 * 转换静态资源require('some.png')语法为import
 * @returns
 */
function transformSyntaxOfProcessDotEnv() {

  /**
   * 合法检测
   * 1. 不包含node_modules
   * 2. 后缀结尾以js|jsx|ts|tsx|vue
   * @param path
   */
  const pathIsValid = (path) => {
    const reg = /\.(js|jsx|ts|tsx|vue)$/;
    return !~path.indexOf("node_modules") && reg.test(path);
  };

  /**
   * 静态资源路径检查
   * @param path
   * @returns
   */
  const notStaticPath = (path: string): boolean => {
    if (!path) return true;
    const list = path.split('.');
    return list.length <= 1 || !staticPathSuffix.includes(list.pop() as string);
  };

  // 访问器
  const visitor = {
    Identifier(path, pass) {
      if (path.node.name !== "require") return;
      // get arg
      let requireArgs0 = path.container.arguments[0];
      // static path check
      if (notStaticPath(requireArgs0.value || requireArgs0.raw)) return;

      // create var name to replace pre name
      const varName = `vite_plugin_transform_syntax_require_static_${uuid()}`;
      // create import syntax
      const importAst = types.importDeclaration(
        [types.importDefaultSpecifier(types.identifier(varName))],
        types.stringLiteral(path.container?.arguments?.[0]?.value)
      );

      // overwrite
      // console.log("requireArgs0:::", path.node);
      path.node.name = '__vite_plugin_transform_syntax_require_static_resource__';
      // pass.file.ast.program.body.unshift(importAst);
      // create new identifier
      path.parentPath.parent[
        types.isVariableDeclarator(path.parentPath.parent) ? "init" : "right"
      ] = types.identifier(varName);
    },
  };

  return {
    name: "vite-plugin-transform-require-static-process",
    async transform(code: string, id: string) {
      try {
        if (!pathIsValid(id)) return;
        const result = babel.transform(code, {
          plugins: [
            ...(id.endsWith(".vue") ? [require("vue-loader")] : []),
            { visitor },
          ],
        });
        console.log(result?.code);
        return { code };
      } catch (error: any) {
        console.error(error);
      }
    },
  };
}

transformSyntaxOfProcessDotEnv().transform(
  `
  function name() {
    if (window.name === 'name') {
      const list = {
        electron: require('electron'),
        unImageUrl: () => require('@/assets/images/man-info.png')
      };
    }
  }
  `,
  "@/assets/images/man-info.js"
);
