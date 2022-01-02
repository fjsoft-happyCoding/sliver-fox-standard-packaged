/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-24 15:31:06
 * @LastEditTime: 2021-12-25 15:41:03
 * @LastEditors: RGXMG
 * @Description: 字段校验
 */

export type TFields = Array<string | { [k: string]: Array<string> }>

/**
 * 执行方法
 * @param data 
 * @param fields 
 * @returns 
 */
function execute(data: Object, fields: TFields): Array<string> {
  let errMsg: Array<string> = [];
  if (!data || typeof data !== 'object') return ['data不存在！'];
  if (!fields || !Array.isArray(fields) || !fields.length) return ['验证规则不合法！'];
  for (const i of fields) {
    // 对象
    if (typeof i === "object" && !Array.isArray(i)) {
      const key = Object.keys(i)[0];
      const item = data[key];

      // 外层fields名称
      if (!item) errMsg.push(`未找到有效的${key}字段值`);
      // 循环内层
      errMsg.push(...execute(item || {}, i[key]));
      // 普通string
    } else if (typeof i === "string") {
      if (!data[i]) errMsg.push(`未找到有效的${i}字段值`);
    }
  }
  return errMsg;
}

/**
 * 字段验证
 * @param data 
 * @param fields 
 */
function fieldsValidate(data: Object, fields: TFields) {
  const errMsg = execute(data, fields);
  if (errMsg.length) throw new Error(errMsg.toString());
}

export  {
  fieldsValidate
}