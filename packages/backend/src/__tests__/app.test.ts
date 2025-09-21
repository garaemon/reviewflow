import request from 'supertest'
import { app } from '../index'

describe('Express App', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)

      expect(response.body).toHaveProperty('status', 'ok')
      expect(response.body).toHaveProperty('timestamp')
      expect(typeof response.body.timestamp).toBe('string')
    })

    it('should return valid timestamp format', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)

      const timestamp = new Date(response.body.timestamp)
      expect(timestamp).toBeInstanceOf(Date)
      expect(timestamp.getTime()).not.toBeNaN()
    })
  })

  describe('CORS configuration', () => {
    it('should have CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)

      expect(response.headers).toHaveProperty('access-control-allow-origin')
    })
  })

  describe('API routes', () => {
    it('should respond to review routes', async () => {
      // Test that review route exists and returns repo config
      await request(app)
        .get('/api/review/current-repo')
        .expect((res) => {
          // Should return 200 with repo config since it's always set
          expect(res.status).toBe(200)
          expect(res.body).toHaveProperty('repositoryPath')
          expect(res.body).toHaveProperty('baseCommit')
          expect(res.body).toHaveProperty('targetCommit')
        })
    })

    it('should respond to git routes', async () => {
      await request(app)
        .get('/api/git/status/test-repo')
        .expect((res) => {
          // Should return 500 for invalid repo, not route not found
          expect(res.status).toBe(500)
          expect(res.body.message).toContain('directory that does not exist')
        })
    })

    it('should respond to settings routes', async () => {
      await request(app)
        .get('/api/settings')
        .expect((res) => {
          expect(res.status).not.toBe(404)
        })
    })
  })
})