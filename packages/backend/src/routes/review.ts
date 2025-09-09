import { Router } from 'express'
import { ReviewService } from '../services/ReviewService.js'

const router = Router()

router.get('/sessions', async (_req, res) => {
  try {
    const reviewService = new ReviewService()
    const sessions = await reviewService.getAllSessions()
    res.json(sessions)
  } catch (error) {
    console.error('Error getting sessions:', error)
    res.status(500).json({ 
      error: 'Failed to get sessions',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

router.post('/sessions', async (req, res) => {
  try {
    const { repositoryPath, baseCommit, targetCommit } = req.body
    
    if (!repositoryPath) {
      return res.status(400).json({ error: 'Repository path is required' })
    }

    const reviewService = new ReviewService()
    const session = await reviewService.createSession({
      repositoryPath,
      baseCommit: baseCommit || 'HEAD~1',
      targetCommit: targetCommit || 'HEAD'
    })
    
    res.status(201).json(session)
  } catch (error) {
    console.error('Error creating session:', error)
    res.status(500).json({ 
      error: 'Failed to create session',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    const reviewService = new ReviewService()
    const session = await reviewService.getSession(sessionId)
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }
    
    res.json(session)
  } catch (error) {
    console.error('Error getting session:', error)
    res.status(500).json({ 
      error: 'Failed to get session',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

router.patch('/hunks/:hunkId/status', async (req, res) => {
  try {
    const { hunkId } = req.params
    const { status } = req.body
    
    if (!['pending', 'reviewed', 'noted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const reviewService = new ReviewService()
    await reviewService.updateHunkStatus(hunkId, status)
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error updating hunk status:', error)
    res.status(500).json({ 
      error: 'Failed to update hunk status',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

router.post('/notes', async (req, res) => {
  try {
    const { hunkId, lineNumber, type, content } = req.body
    
    if (!hunkId || !type || !content) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (!['memo', 'comment'].includes(type)) {
      return res.status(400).json({ error: 'Invalid note type' })
    }

    const reviewService = new ReviewService()
    const note = await reviewService.createNote({
      hunkId,
      lineNumber,
      type,
      content
    })
    
    res.status(201).json(note)
  } catch (error) {
    console.error('Error creating note:', error)
    res.status(500).json({ 
      error: 'Failed to create note',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export { router as reviewRoutes }