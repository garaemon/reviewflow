import { existsSync } from 'fs'
import { join } from 'path'
import chalk from 'chalk'
import { getConfig, getDatabasePath, getSessionDir } from '../utils/config.js'

export async function statusCommand() {
  const cwd = process.cwd()
  const config = getConfig()
  const dbPath = getDatabasePath()
  const sessionDir = getSessionDir()

  try {
    console.log(chalk.blue('ReviewFlow Status'))
    console.log(chalk.gray('================'))
    console.log()

    console.log(chalk.yellow('Current Directory:'), cwd)
    console.log(chalk.yellow('Config Location:'), chalk.gray('~/.config/review/config.json'))
    console.log(chalk.yellow('Database:'), existsSync(dbPath) ? chalk.green('✓') : chalk.gray('Not created yet'))
    console.log(chalk.yellow('Cache Directory:'), chalk.gray('~/.cache/reviewflow/'))

    console.log()
    console.log(chalk.blue('Configuration:'))
    console.log(chalk.gray('  Context Lines:'), config.contextLines)
    console.log(chalk.gray('  View Mode:'), config.viewMode)
    console.log(chalk.gray('  Dark Mode:'), config.darkMode ? 'enabled' : 'disabled')
    console.log(chalk.gray('  Show Whitespace:'), config.showWhitespace ? 'enabled' : 'disabled')
    console.log(chalk.gray('  Default Port:'), config.defaultPort)
    console.log(chalk.gray('  Auto Open Browser:'), config.autoOpenBrowser ? 'enabled' : 'disabled')

    // Check for active session
    const currentSessionPath = join(sessionDir, 'current-session.json')
    if (existsSync(currentSessionPath)) {
      console.log()
      console.log(chalk.blue('Active Session:'))
      const sessionData = JSON.parse(require('fs').readFileSync(currentSessionPath, 'utf-8'))
      console.log(chalk.gray('  Session ID:'), sessionData.sessionId)
      console.log(chalk.gray('  Repository:'), sessionData.repositoryPath)
      console.log(chalk.gray('  Range:'), `${sessionData.baseCommit}..${sessionData.targetCommit}`)
      console.log(chalk.gray('  Created:'), new Date(sessionData.createdAt).toLocaleString())
    }

    console.log()
    console.log(chalk.gray('To start a review session, run: review start'))

  } catch (error) {
    console.error(chalk.red('Error reading status:'), error)
  }
}