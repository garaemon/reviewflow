import express from 'express'
import cors from 'cors'
import { reviewRoutes } from './routes/review.js'
import { gitRoutes } from './routes/git.js'
import { settingsRoutes } from './routes/settings.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/review', reviewRoutes)
app.use('/api/git', gitRoutes)
app.use('/api/settings', settingsRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`ReviewFlow API server running on port ${PORT}`)
  })
}

export { app }