/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-15 17:46:39
 * @LastEditTime: 2021-12-19 13:43:10
 * @LastEditors: RGXMG
 * @Description: 日期相关
 */

function getDate(format = 'YYYY.MM.DD') {
  const date = new Date();
  const year = date.getFullYear().toString();
  let month = (date.getMonth() + 1).toString();
  month = Number(month) < 10 ? `0${month}` : month;
  let day = date.getDate().toString();
  day = Number(day) < 10 ? `0${month}` : day;
  format = format.replace('YYYY', year);
  format = format.replace('MM', month);
  format = format.replace('DD', day);
  return format;
}
export  {
  getDate
};