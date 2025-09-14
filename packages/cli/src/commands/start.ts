import { join } from 'path'
import { existsSync } from 'fs'
import { spawn } from 'child_process'
import chalk from 'chalk'
import open from 'open'

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
  
  // Parse the range to get base and target commits
  const [baseCommit, targetCommit] = options.range.includes('..')
    ? options.range.split('..')
    : ['HEAD~1', 'HEAD']

  // Start the ReviewFlow servers
  console.log(chalk.blue('Starting ReviewFlow servers...'))
  
  const backendProcess = spawn('pnpm', ['--filter', '@reviewflow/backend', 'dev'], {
    stdio: 'pipe',
    cwd: findReviewFlowRoot()
  })
  
  const frontendProcess = spawn('pnpm', ['--filter', '@reviewflow/frontend', 'dev'], {
    stdio: 'pipe',
    cwd: findReviewFlowRoot()
  })

  // Handle Ctrl-C to gracefully shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 Shutting down ReviewFlow...'))
    backendProcess.kill('SIGTERM')
    frontendProcess.kill('SIGTERM')
    process.exit(0)
  })

  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Create a review session via API
  try {
    console.log(chalk.blue('Creating review session...'))
    
    const response = await fetch('http://localhost:3001/api/review/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repositoryPath: cwd,
        baseCommit,
        targetCommit
      })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`)
    }
    
    const session = await response.json()
    console.log(chalk.green('✓ Review session created'))
    console.log(chalk.gray('Session ID:'), session.id)
    
    // Store the current session ID for the frontend to use
    const sessionInfoPath = join(reviewflowDir, 'current-session.json')
    const fs = await import('fs')
    await fs.promises.writeFile(sessionInfoPath, JSON.stringify({
      sessionId: session.id,
      repositoryPath: cwd,
      baseCommit,
      targetCommit,
      createdAt: new Date().toISOString()
    }, null, 2))
    
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not create session via API'))
    console.log(chalk.gray('Server may still be starting up...'))
    console.log(chalk.gray('Error:'), error instanceof Error ? error.message : 'Unknown error')
  }
  
  const url = `http://localhost:${options.port}`
  
  try {
    console.log(chalk.blue('Opening browser...'))
    await open(url)
    console.log(chalk.green('✓ Browser opened'))
  } catch (error) {
    console.log(chalk.yellow('Could not open browser automatically'))
    console.log(chalk.gray(`Please visit: ${url}`))
  }

  console.log()
  console.log(chalk.green('ReviewFlow is running!'))
  console.log(chalk.gray('Press Ctrl-C to stop the server'))
  
  // Keep the process alive
  await new Promise(() => {
    // This will keep the process running until SIGINT is received
  })
}

function findReviewFlowRoot(): string {
  const currentFileUrl = import.meta.url
  const currentFileDir = new URL('.', currentFileUrl).pathname
  const packageJsonPath = join(currentFileDir, '../../../package.json')
  if (existsSync(packageJsonPath)) {
    return join(currentFileDir, '../../..')
  }
  
  // Fallback: look for pnpm-workspace.yaml in parent directories
  let currentDir = process.cwd()
  while (currentDir !== '/') {
    const workspaceFile = join(currentDir, 'pnpm-workspace.yaml')
    if (existsSync(workspaceFile)) {
      return currentDir
    }
    currentDir = join(currentDir, '..')
  }
  
  throw new Error('Could not find ReviewFlow root directory')
}