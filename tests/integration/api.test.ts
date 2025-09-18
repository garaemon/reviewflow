import request from 'supertest'
import { app } from '../../packages/backend/src/index'

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    it('should return health status with proper structure', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)
        .expect('Content-Type', /json/)

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String)
      })

      // Verify timestamp is valid ISO string
      const timestamp = new Date(response.body.timestamp)
      expect(timestamp.toISOString()).toBe(response.body.timestamp)
    })
  })

  describe('CORS Configuration', () => {
    it('should handle preflight requests', async () => {
      await request(app)
        .options('/api/health')
        .expect(204)
    })

    it('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)

      expect(response.headers['access-control-allow-origin']).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404)
    })

    it('should handle malformed JSON in request body', async () => {
      await request(app)
        .post('/api/review')
        .send('{"invalid": json}')
        .expect(400)
    })
  })

  describe('API Routes Existence', () => {
    it('should respond to review API routes', async () => {
      // Test that the route exists (may return various status codes depending on implementation)
      const response = await request(app)
        .get('/api/review')

      // Should not be a 404 (route not found)
      expect(response.status).not.toBe(404)
    })

    it('should respond to git API routes', async () => {
      const response = await request(app)
        .get('/api/git/status')

      expect(response.status).not.toBe(404)
    })

    it('should respond to settings API routes', async () => {
      const response = await request(app)
        .get('/api/settings')

      expect(response.status).not.toBe(404)
    })
  })

  describe('Request/Response Headers', () => {
    it('should accept JSON content type', async () => {
      const response = await request(app)
        .post('/api/settings')
        .set('Content-Type', 'application/json')
        .send({ test: 'data' })

      // Should not reject based on content type
      expect(response.status).not.toBe(415)
    })

    it('should return JSON responses', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)

      expect(response.headers['content-type']).toMatch(/application\/json/)
    })
  })
})