import { create } from 'zustand'
import type { FileDiff, ReviewStatus, ReviewNote } from '@reviewflow/shared'
import { generateId } from '@reviewflow/shared'

interface ReviewStore {
  currentFiles: FileDiff[]
  repositoryPath: string | null
  baseCommit: string | null
  targetCommit: string | null
  loading: boolean
  error: string | null
  notes: Record<string, ReviewNote[]>

  // Actions
  loadDiff: (repositoryPath: string, baseCommit: string, targetCommit: string) => Promise<void>
  loadUncommittedChanges: (repositoryPath: string) => Promise<void>
  updateHunkStatus: (hunkId: string, status: ReviewStatus) => void
  addNote: (hunkId: string, content: string, type: 'memo' | 'comment', lineNumber?: number) => void
  deleteNote: (noteId: string) => void
}


export const useReviewStore = create<ReviewStore>((set, get) => ({
  currentFiles: [],
  repositoryPath: null,
  baseCommit: null,
  targetCommit: null,
  loading: false,
  error: null,
  notes: {},

  loadDiff: async (repositoryPath: string, baseCommit: string, targetCommit: string) => {
    set({ loading: true, error: null })

    try {
      const response = await fetch('/api/git/diff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryPath,
          baseCommit,
          targetCommit
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to load diff: ${response.statusText}`)
      }

      const files: FileDiff[] = await response.json()
      set({
        currentFiles: files,
        repositoryPath,
        baseCommit,
        targetCommit,
        loading: false
      })
    } catch (error) {
      console.error('Failed to load diff:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to load diff',
        loading: false
      })
    }
  },

  loadUncommittedChanges: async (repositoryPath: string) => {
    set({ loading: true, error: null })

    try {
      const response = await fetch('/api/git/uncommitted-diff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repositoryPath })
      })

      if (!response.ok) {
        throw new Error(`Failed to get uncommitted changes: ${response.statusText}`)
      }

      const files: FileDiff[] = await response.json()
      set({
        currentFiles: files,
        repositoryPath,
        baseCommit: 'working-tree',
        targetCommit: 'uncommitted',
        loading: false
      })
    } catch (error) {
      console.error('Failed to load uncommitted changes:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to load uncommitted changes',
        loading: false
      })
    }
  },

  updateHunkStatus: (hunkId: string, status: ReviewStatus) => {
    const { currentFiles } = get()

    const updatedFiles = currentFiles.map((file: any) => ({
      ...file,
      hunks: file.hunks.map((hunk: any) =>
        hunk.id === hunkId ? { ...hunk, reviewStatus: status } : hunk
      )
    }))

    set({ currentFiles: updatedFiles })
  },

  addNote: (hunkId: string, content: string, type: 'memo' | 'comment', lineNumber?: number) => {
    const note: ReviewNote = {
      id: generateId(),
      hunkId,
      lineNumber,
      type,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const currentNotes = get().notes
    const hunkNotes = currentNotes[hunkId] || []
    set({
      notes: {
        ...currentNotes,
        [hunkId]: [...hunkNotes, note]
      }
    })
  },

  deleteNote: (noteId: string) => {
    const currentNotes = get().notes
    const updatedNotes: Record<string, ReviewNote[]> = {}

    Object.keys(currentNotes).forEach(hunkId => {
      updatedNotes[hunkId] = currentNotes[hunkId].filter(note => note.id !== noteId)
    })

    set({ notes: updatedNotes })
  }
}))