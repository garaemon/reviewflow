import { homedir } from 'os'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

interface ReviewFlowConfig {
  contextLines: number
  showWhitespace: boolean
  darkMode: boolean
  viewMode: string
  autoOpenBrowser: boolean
  defaultPort: number
}

const DEFAULT_CONFIG: ReviewFlowConfig = {
  contextLines: 3,
  showWhitespace: false,
  darkMode: true,
  viewMode: 'unified',
  autoOpenBrowser: true,
  defaultPort: 3000
}

function getConfigDir(): string {
  return join(homedir(), '.config', 'review')
}

function getCacheDir(): string {
  return join(homedir(), '.cache', 'reviewflow')
}

export function ensureConfigDir(): string {
  const configDir = getConfigDir()
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }
  return configDir
}

export function ensureCacheDir(): string {
  const cacheDir = getCacheDir()
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true })
  }
  return cacheDir
}

export function getConfig(): ReviewFlowConfig {
  const configDir = ensureConfigDir()
  const configPath = join(configDir, 'config.json')

  if (!existsSync(configPath)) {
    // Create default config if it doesn't exist
    writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2))
    return DEFAULT_CONFIG
  }

  try {
    const configData = readFileSync(configPath, 'utf-8')
    return { ...DEFAULT_CONFIG, ...JSON.parse(configData) }
  } catch (error) {
    console.warn('Warning: Could not read config file, using defaults')
    return DEFAULT_CONFIG
  }
}

export function updateConfig(updates: Partial<ReviewFlowConfig>): void {
  const configDir = ensureConfigDir()
  const configPath = join(configDir, 'config.json')
  const currentConfig = getConfig()
  const newConfig = { ...currentConfig, ...updates }

  writeFileSync(configPath, JSON.stringify(newConfig, null, 2))
}

export function getSessionDir(): string {
  const cacheDir = ensureCacheDir()
  const sessionDir = join(cacheDir, 'sessions')
  if (!existsSync(sessionDir)) {
    mkdirSync(sessionDir, { recursive: true })
  }
  return sessionDir
}

export function getDatabasePath(): string {
  const cacheDir = ensureCacheDir()
  return join(cacheDir, 'reviews.db')
}