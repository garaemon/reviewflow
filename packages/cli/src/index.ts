#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { startCommand } from './commands/start.js'
import { initCommand } from './commands/init.js'
import { statusCommand } from './commands/status.js'

const program = new Command()

program
  .name('review')
  .description('ReviewFlow - Code review support tool')
  .version('0.1.0')

program
  .command('init')
  .description('Initialize ReviewFlow in current directory')
  .action(initCommand)

program
  .command('start')
  .description('Start a review session')
  .option('-r, --range <range>', 'Git range to review (e.g., HEAD~3..HEAD)', 'HEAD~1..HEAD')
  .option('-f, --files <pattern>', 'File pattern to review')
  .option('-p, --port <port>', 'Port for web UI', '3000')
  .action(startCommand)

program
  .command('status')
  .description('Show current review status')
  .action(statusCommand)

program.parse()

if (program.args.length === 0) {
  console.log(chalk.blue('ReviewFlow - Code review support tool'))
  console.log()
  console.log(chalk.yellow('Usage:'))
  console.log('  review init      Initialize ReviewFlow in current directory')
  console.log('  review start     Start a review session')
  console.log('  review status    Show current review status')
  console.log()
  console.log(chalk.gray('For more information, run: review --help'))
}