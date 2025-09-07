import { Router } from 'express'
import { join, dirname } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import type { ReviewConfig } from '@reviewflow/shared'

const router = Router()

const getConfigPath = () => {
  const repositoryPath = process.env.REPOSITORY_PATH || process.cwd()
  return join(repositoryPath, '.reviewflow', 'config.json')
}

const getDefaultConfig = (): ReviewConfig => ({
  contextLines: 3,
  showWhitespace: false,
  darkMode: true,
  viewMode: 'unified'
})

router.get('/', (req, res) => {
  try {
    const configPath = getConfigPath()
    
    if (existsSync(configPath)) {
      const configData = readFileSync(configPath, 'utf-8')
      const config = JSON.parse(configData)
      res.json(config)
    } else {
      const defaultConfig = getDefaultConfig()
      res.json(defaultConfig)
    }
  } catch (error) {
    console.error('Error reading config:', error)
    res.status(500).json({ 
      error: 'Failed to read config',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

router.post('/', (req, res) => {
  try {
    const config: ReviewConfig = req.body
    
    // Validate config
    if (typeof config.contextLines !== 'number' || config.contextLines < 0 || config.contextLines > 10) {
      return res.status(400).json({ error: 'Invalid contextLines value' })
    }
    
    if (!['unified', 'split'].includes(config.viewMode)) {
      return res.status(400).json({ error: 'Invalid viewMode value' })
    }
    
    const configPath = getConfigPath()
    
    // Merge with existing config to preserve other settings
    let existingConfig = getDefaultConfig()
    if (existsSync(configPath)) {
      try {
        const existingData = readFileSync(configPath, 'utf-8')
        existingConfig = { ...existingConfig, ...JSON.parse(existingData) }
      } catch (error) {
        console.warn('Failed to read existing config, using defaults')
      }
    }
    
    const mergedConfig = { ...existingConfig, ...config }
    
    // Ensure directory exists
    const configDir = dirname(configPath)
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true })
    }
    
    writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2))
    res.json({ success: true, config: mergedConfig })
    
  } catch (error) {
    console.error('Error saving config:', error)
    res.status(500).json({ 
      error: 'Failed to save config',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export { router as settingsRoutes }