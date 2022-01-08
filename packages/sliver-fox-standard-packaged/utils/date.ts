/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-15 17:46:39
 * @LastEditTime: 2022-01-04 20:52:43
 * @LastEditors: RGXMG
 * @Description: 日期相关
 */

function getDate(format = 'YYYY.MM.DD HH:mm:ss') {
  const date = new Date();
  const year = date.getFullYear().toString();
  let month = (date.getMonth() + 1).toString();
  month = Number(month) < 10 ? `0${month}` : month;
  let day = date.getDate().toString();
  day = Number(day) < 10 ? `0${day}` : day;
  let hour = date.getHours().toString();
  hour = Number(hour) < 10 ? `0${hour}` : hour;
  let minutes = date.getMinutes().toString();
  minutes = Number(minutes) < 10 ? `0${minutes}` : minutes;
  let seconds = date.getSeconds().toString();
  seconds = Number(seconds) < 10 ? `0${seconds}` : seconds;
  format = format.replace('YYYY', year);
  format = format.replace('MM', month);
  format = format.replace('DD', day);
  format = format.replace('HH', hour);
  format = format.replace('mm', minutes);
  format = format.replace('ss', seconds);
  return format;
}
export  {
  getDate
};