import sqlite3 from 'sqlite3'
import type { ReviewSession, ReviewNote, ReviewStatus } from '@shared/types/index.js'
import { generateId } from '@shared/utils/index.js'
import { GitService } from './GitService.js'
import { join, dirname } from 'path'
import { mkdirSync, existsSync } from 'fs'

export class ReviewService {
  private db: sqlite3.Database

  constructor(dbPath?: string) {
    const path = dbPath || join(process.cwd(), '.reviewflow', 'reviews.db')

    // Create directory if it doesn't exist
    const dir = dirname(path)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

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

    await new Promise<void>((resolve, reject) => {
      this.db.run(`
        INSERT INTO review_sessions (id, repository_path, base_commit, target_commit, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, sessionId, repositoryPath, baseCommit, targetCommit, now, now, (err: any) => {
        if (err) reject(err)
        else resolve()
      })
    })

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
    const session = await new Promise<any>((resolve, reject) => {
      this.db.get(`
        SELECT * FROM review_sessions WHERE id = ?
      `, sessionId, (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })

    if (!session) {
      return null
    }

    const gitService = new GitService(session.repository_path)
    const files = await gitService.getDiff(session.base_commit, session.target_commit)

    const hunkStatuses = await new Promise<any[]>((resolve, reject) => {
      this.db.all(`
        SELECT hunk_id, status FROM hunk_status WHERE session_id = ?
      `, sessionId, (err, rows) => {
        if (err) reject(err)
        else resolve(rows || [])
      })
    })

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
    const sessions = await new Promise<any[]>((resolve, reject) => {
      this.db.all(`
        SELECT * FROM review_sessions ORDER BY updated_at DESC
      `, (err: any, rows: any[]) => {
        if (err) reject(err)
        else resolve(rows || [])
      })
    })

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
    const now = new Date().toISOString()

    await new Promise<void>((resolve, reject) => {
      this.db.run(`
        INSERT OR REPLACE INTO hunk_status (hunk_id, session_id, status, updated_at)
        VALUES (?, (SELECT id FROM review_sessions LIMIT 1), ?, ?)
      `, hunkId, status, now, (err: any) => {
        if (err) reject(err)
        else resolve()
      })
    })
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

    await new Promise<void>((resolve, reject) => {
      this.db.run(`
        INSERT INTO review_notes (id, hunk_id, line_number, type, content, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, noteId, hunkId, lineNumber, type, content, now, now, (err: any) => {
        if (err) reject(err)
        else resolve()
      })
    })

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