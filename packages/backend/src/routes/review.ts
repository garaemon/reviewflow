import { Router } from 'express'

const router = Router()

router.get('/current-repo', async (req, res) => {
  const repoConfig = req.app.locals.repoConfig
  if (!repoConfig) {
    return res.status(404).json({ error: 'No repository config found' })
  }
  res.json(repoConfig)
})

export { router as reviewRoutes }