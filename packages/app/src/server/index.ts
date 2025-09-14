import express from 'express'
import cors from 'cors'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { reviewRoutes } from './routes/review.js'
import { gitRoutes } from './routes/git.js'
import { settingsRoutes } from './routes/settings.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Static file serving
app.use(express.static(resolve(__dirname, '../public')))

// API routes
app.use('/api/review', reviewRoutes)
app.use('/api/git', gitRoutes)
app.use('/api/settings', settingsRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// SPA fallback - serve index.html for non-API routes
app.get('*', (_req, res) => {
  res.sendFile(resolve(__dirname, '../public/index.html'))
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`ReviewFlow API server running on port ${PORT}`)
  })
}

export { app }