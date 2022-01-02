#!/usr/bin/env node --max_old_space_size=6144
/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2021-12-18 23:35:48
 * @LastEditTime: 2021-12-19 21:30:41
 * @LastEditors: RGXMG
 * @Description: 
 */
import { program } from 'commander';
import { init } from '../lib/commands/init';
program.parse(process.argv);

init();