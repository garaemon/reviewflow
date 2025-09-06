import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import ora from 'ora'
import open from 'open'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface StartOptions {
  range: string
  files?: string
  port: string
}

export async function startCommand(options: StartOptions) {
  const cwd = process.cwd()
  const reviewflowDir = join(cwd, '.reviewflow')

  if (!existsSync(reviewflowDir)) {
    console.log(chalk.red('ReviewFlow not initialized in this directory'))
    console.log(chalk.gray('Run "review init" first'))
    process.exit(1)
  }

  console.log(chalk.blue('🚀 Starting ReviewFlow...'))
  console.log()
  console.log(chalk.yellow('Repository:'), cwd)
  console.log(chalk.yellow('Git range:'), options.range)
  
  if (options.files) {
    console.log(chalk.yellow('Files pattern:'), options.files)
  }
  
  console.log()
  console.log(chalk.gray('For development, please manually run:'))
  console.log(chalk.cyan('  cd reviewflow-project'))
  console.log(chalk.cyan('  pnpm dev'))
  console.log()
  console.log(chalk.gray('Then visit: http://localhost:3000'))
  
  // For now, just open the URL if it's already running
  const url = `http://localhost:${options.port}`
  
  try {
    console.log(chalk.blue('Opening browser...'))
    await open(url)
    console.log(chalk.green('✓ Browser opened'))
  } catch (error) {
    console.log(chalk.yellow('Could not open browser automatically'))
    console.log(chalk.gray(`Please visit: ${url}`))
  }
}