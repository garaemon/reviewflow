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
app.use(express.static(resolve(__dirname, '../../dist/public')))

// Proxy API requests to backend server
app.use('/api', async (req, res) => {
  try {
    const backendUrl = `http://localhost:3001${req.originalUrl}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Copy relevant headers, filtering out problematic ones
    const allowedHeaders = ['authorization', 'user-agent', 'accept']
    allowedHeaders.forEach(header => {
      if (req.headers[header] && typeof req.headers[header] === 'string') {
        headers[header] = req.headers[header] as string
      }
    })

    const response = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    })

    if (!response.ok) {
      console.error(`Backend error: ${response.status} ${response.statusText}`)
      return res.status(response.status).json({ error: response.statusText })
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Proxy error' })
  }
})

// SPA fallback - serve index.html for non-API routes
app.get('*', (_req, res) => {
  res.sendFile(resolve(__dirname, '../../dist/public/index.html'))
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`ReviewFlow API server running on port ${PORT}`)
  })
}

export { app }