import sqlite3 from 'sqlite3'
import type { ReviewSession, ReviewNote, ReviewStatus } from '@reviewflow/shared'
import { generateId } from '@reviewflow/shared'
import { GitService } from './GitService.js'
import { join } from 'path'

export class ReviewService {
  private db: sqlite3.Database

  constructor(dbPath?: string) {
    const path = dbPath || join(process.cwd(), '.reviewflow', 'reviews.db')
    this.db = new sqlite3.Database(path)
    this.initializeDatabase()
  }

  private initializeDatabase() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS review_sessions (
          id TEXT PRIMARY KEY,
          repository_path TEXT NOT NULL,
          base_commit TEXT NOT NULL,
          target_commit TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `)

      this.db.run(`
        CREATE TABLE IF NOT EXISTS hunk_status (
          hunk_id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          status TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (session_id) REFERENCES review_sessions(id)
        )
      `)

      this.db.run(`
        CREATE TABLE IF NOT EXISTS review_notes (
          id TEXT PRIMARY KEY,
          hunk_id TEXT NOT NULL,
          line_number INTEGER,
          type TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `)
    })
  }

  async createSession(params: {
    repositoryPath: string
    baseCommit: string
    targetCommit: string
  }): Promise<ReviewSession> {
    const { repositoryPath, baseCommit, targetCommit } = params
    const sessionId = generateId()
    const now = new Date().toISOString()

    const gitService = new GitService(repositoryPath)
    const files = await gitService.getDiff(baseCommit, targetCommit)

    const run = promisify(this.db.run.bind(this.db))
    await run(`
      INSERT INTO review_sessions (id, repository_path, base_commit, target_commit, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, sessionId, repositoryPath, baseCommit, targetCommit, now, now)

    const session: ReviewSession = {
      id: sessionId,
      repositoryPath,
      baseCommit,
      targetCommit,
      createdAt: now,
      updatedAt: now,
      files
    }

    return session
  }

  async getSession(sessionId: string): Promise<ReviewSession | null> {
    const get = promisify(this.db.get.bind(this.db))
    const all = promisify(this.db.all.bind(this.db))

    const session = await get(`
      SELECT * FROM review_sessions WHERE id = ?
    `, sessionId) as any

    if (!session) {
      return null
    }

    const gitService = new GitService(session.repository_path)
    const files = await gitService.getDiff(session.base_commit, session.target_commit)

    const hunkStatuses = await all(`
      SELECT hunk_id, status FROM hunk_status WHERE session_id = ?
    `, sessionId) as any[]

    const statusMap = new Map(hunkStatuses.map(h => [h.hunk_id, h.status]))

    for (const file of files) {
      for (const hunk of file.hunks) {
        hunk.reviewStatus = statusMap.get(hunk.id) || 'pending'
      }
    }

    return {
      id: session.id,
      repositoryPath: session.repository_path,
      baseCommit: session.base_commit,
      targetCommit: session.target_commit,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      files
    }
  }

  async getAllSessions(): Promise<ReviewSession[]> {
    const all = promisify(this.db.all.bind(this.db))
    
    const sessions = await all(`
      SELECT * FROM review_sessions ORDER BY updated_at DESC
    `) as any[]

    return sessions.map(session => ({
      id: session.id,
      repositoryPath: session.repository_path,
      baseCommit: session.base_commit,
      targetCommit: session.target_commit,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      files: []
    }))
  }

  async updateHunkStatus(hunkId: string, status: ReviewStatus): Promise<void> {
    const run = promisify(this.db.run.bind(this.db))
    const now = new Date().toISOString()

    await run(`
      INSERT OR REPLACE INTO hunk_status (hunk_id, session_id, status, updated_at)
      VALUES (?, (SELECT id FROM review_sessions LIMIT 1), ?, ?)
    `, hunkId, status, now)
  }

  async createNote(params: {
    hunkId: string
    lineNumber?: number
    type: 'memo' | 'comment'
    content: string
  }): Promise<ReviewNote> {
    const { hunkId, lineNumber, type, content } = params
    const noteId = generateId()
    const now = new Date().toISOString()

    const run = promisify(this.db.run.bind(this.db))
    await run(`
      INSERT INTO review_notes (id, hunk_id, line_number, type, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, noteId, hunkId, lineNumber, type, content, now, now)

    return {
      id: noteId,
      hunkId,
      lineNumber,
      type,
      content,
      createdAt: now,
      updatedAt: now
    }
  }

  close(): void {
    this.db.close()
  }
}