/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2022-01-31 11:47:30
 * @LastEditTime: 2022-01-31 11:49:37
 * @LastEditors: RGXMG
 * @Description: unique id
 */

/**
 * 生成uuid
 * @returns 
 */
function uuid(): string {
  return Math.random().toString(36).substring(2).toUpperCase() + Date.now()
}

export default uuid;