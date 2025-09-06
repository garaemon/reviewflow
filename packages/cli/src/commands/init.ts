import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import chalk from 'chalk'

export async function initCommand() {
  const cwd = process.cwd()
  const reviewflowDir = join(cwd, '.reviewflow')

  try {
    if (!existsSync(reviewflowDir)) {
      mkdirSync(reviewflowDir, { recursive: true })
      console.log(chalk.green('✓ Created .reviewflow directory'))
    } else {
      console.log(chalk.yellow('! .reviewflow directory already exists'))
    }

    const configPath = join(reviewflowDir, 'config.json')
    if (!existsSync(configPath)) {
      const defaultConfig = {
        contextLines: 3,
        showWhitespace: false,
        darkMode: true,
        viewMode: 'unified',
        autoOpenBrowser: true,
        defaultPort: 3000
      }
      
      writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
      console.log(chalk.green('✓ Created config.json with default settings'))
    } else {
      console.log(chalk.yellow('! config.json already exists'))
    }

    console.log()
    console.log(chalk.blue('ReviewFlow initialized successfully!'))
    console.log(chalk.gray('Run "review start" to begin a review session'))
    
  } catch (error) {
    console.error(chalk.red('Error initializing ReviewFlow:'), error)
    process.exit(1)
  }
}