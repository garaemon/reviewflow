import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import chalk from 'chalk'

export async function statusCommand() {
  const cwd = process.cwd()
  const reviewflowDir = join(cwd, '.reviewflow')

  if (!existsSync(reviewflowDir)) {
    console.log(chalk.red('ReviewFlow not initialized in this directory'))
    console.log(chalk.gray('Run "review init" first'))
    return
  }

  try {
    const configPath = join(reviewflowDir, 'config.json')
    const dbPath = join(reviewflowDir, 'reviews.db')

    console.log(chalk.blue('ReviewFlow Status'))
    console.log(chalk.gray('================'))
    console.log()

    console.log(chalk.yellow('Directory:'), cwd)
    console.log(chalk.yellow('Config:'), existsSync(configPath) ? chalk.green('✓') : chalk.red('✗'))
    console.log(chalk.yellow('Database:'), existsSync(dbPath) ? chalk.green('✓') : chalk.red('✗'))

    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'))
      console.log()
      console.log(chalk.blue('Configuration:'))
      console.log(chalk.gray('  Context Lines:'), config.contextLines)
      console.log(chalk.gray('  View Mode:'), config.viewMode)
      console.log(chalk.gray('  Dark Mode:'), config.darkMode ? 'enabled' : 'disabled')
      console.log(chalk.gray('  Show Whitespace:'), config.showWhitespace ? 'enabled' : 'disabled')
      console.log(chalk.gray('  Default Port:'), config.defaultPort)
    }

    console.log()
    console.log(chalk.gray('To start a review session, run: review start'))

  } catch (error) {
    console.error(chalk.red('Error reading status:'), error)
  }
}