import { Router } from 'express'
import { readFileSync } from 'fs'
import { join } from 'path'

const router = Router()

router.get('/current-repo', async (_req, res) => {
  try {
    const repoInfoPath = join(process.cwd(), '.cache/reviewflow/sessions/current-repo.json')
    const repoInfo = JSON.parse(readFileSync(repoInfoPath, 'utf-8'))
    res.json(repoInfo)
  } catch (error) {
    res.status(404).json({ error: 'No current repository info found' })
  }
})

export { router as reviewRoutes }