#!/usr/bin/env node --max_old_space_size=6144
/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-18 23:22:45
 * @LastEditTime: 2021-12-19 21:36:47
 * @LastEditors: RGXMG
 * @Description: 
 */
import { program } from 'commander';
import packageJson from '../package.json';

program.version(packageJson.version, '-v, --version')
  .usage('packaged <command> [options]')
  .command('init', '生成packaged.json配置文件，如果packaged.json已存在，则默认失败')
  .command('publish [options]', '发布打包结果')
  .command('changelog [options]', 'changelog日志的操作')
  .parse(process.argv);
