/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-19 20:50:34
 * @LastEditTime: 2021-12-25 17:24:53
 * @LastEditors: RGXMG
 * @Description:
 */
import chalk from 'chalk';
import ProgressBar from 'progress';

/**
 * 创建一个进度条
 * @param title 
 * @returns 
 */
function createProgress(title) {
  // 进度条
  const bar = new ProgressBar(chalk.green(title + ": [:bar] :percent"), {
    total: 100,
    complete: "\u001b[42m \u001b[0m",
    incomplete: "\u001b[41m \u001b[0m",
  });

  // 重载tokens
  const oldTick = bar.tick.bind(bar);
  bar.tick = (tokens?: any) => {
    // 重复的数值不予刷新显示
    if ((bar as any).preTokens === tokens) return;
    oldTick(tokens - ((bar as any).preTokens || 0));
    (bar as any).preTokens = tokens;
  };
  return bar;
}
export {
  createProgress
}