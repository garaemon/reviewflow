import { Router } from 'express'
import { GitService } from '../services/GitService'

const router = Router()

router.post('/diff', async (req, res) => {
  try {
    const { repositoryPath, baseCommit, targetCommit } = req.body
    
    if (!repositoryPath) {
      return res.status(400).json({ error: 'Repository path is required' })
    }

    const gitService = new GitService(repositoryPath)
    const diff = await gitService.getDiff(baseCommit || 'HEAD~1', targetCommit || 'HEAD')
    
    res.json(diff)
  } catch (error) {
    console.error('Error getting diff:', error)
    res.status(500).json({ 
      error: 'Failed to get diff',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

router.get('/status/:repositoryPath(*)', async (req, res) => {
  try {
    const repositoryPath = req.params.repositoryPath
    
    if (!repositoryPath) {
      return res.status(400).json({ error: 'Repository path is required' })
    }

    const gitService = new GitService(repositoryPath)
    const status = await gitService.getStatus()
    
    res.json(status)
  } catch (error) {
    console.error('Error getting git status:', error)
    res.status(500).json({ 
      error: 'Failed to get git status',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export { router as gitRoutes }