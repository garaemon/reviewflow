import express from 'express'
import cors from 'cors'
import { program } from 'commander'
import { reviewRoutes } from './routes/review'
import { gitRoutes } from './routes/git'
import { settingsRoutes } from './routes/settings'

program
  .option('--repo-path <path>', 'Repository path')
  .option('--base-commit <commit>', 'Base commit')
  .option('--target-commit <commit>', 'Target commit')
  .parse()

const options = program.opts()
const repoConfig = {
  repositoryPath: options.repoPath || process.cwd(),
  baseCommit: options.baseCommit || 'HEAD~1',
  targetCommit: options.targetCommit || 'HEAD',
  createdAt: new Date().toISOString()
}

const app = express()
const PORT = process.env.PORT || 3001

app.locals.repoConfig = repoConfig

app.use(cors())
app.use(express.json())

app.use('/api/review', reviewRoutes)
app.use('/api/git', gitRoutes)
app.use('/api/settings', settingsRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`ReviewFlow API server running on port ${PORT}`)
  })
}

export { app }