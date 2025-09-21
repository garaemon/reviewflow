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

  // Mock data for development
  loadMockData: () => void
}

// Mock notes data
const mockNotes: Record<string, ReviewNote[]> = {
  'hunk-1': [
    {
      id: 'note-1',
      hunkId: 'hunk-1',
      lineNumber: 4,
      type: 'memo',
      content: 'Consider using a more descriptive component name',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'note-1b',
      hunkId: 'hunk-1',
      lineNumber: 7,
      type: 'comment',
      content: 'This looks good, but consider adding PropTypes for better type safety.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  'hunk-2': [
    {
      id: 'note-2a',
      hunkId: 'hunk-2',
      lineNumber: 11,
      type: 'memo',
      content: 'Good improvement! Using Intl.DateTimeFormat is more flexible.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  'hunk-3': [
    {
      id: 'note-2',
      hunkId: 'hunk-3',
      lineNumber: 3,
      type: 'comment',
      content: 'This file removal looks good. The new docs structure is better.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'note-3',
      hunkId: 'hunk-3',
      type: 'memo',
      content: 'Remember to update any references to this old README',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
}

// Mock data for development
const mockFiles: FileDiff[] = [
  {
    path: 'src/components/DiffViewer.tsx',
    status: 'added',
    binary: false,
    hunks: [
      {
        id: 'hunk-1',
        oldStart: 0,
        oldLines: 0,
        newStart: 1,
        newLines: 15,
        header: '@@ -0,0 +1,15 @@ import React from "react"',
        reviewStatus: 'unreviewed',
        lines: [
          { type: 'add', newLineNumber: 1, content: 'import React from "react"' },
          { type: 'add', newLineNumber: 2, content: 'import { DiffHunk } from "@shared"' },
          { type: 'add', newLineNumber: 3, content: '' },
          { type: 'add', newLineNumber: 4, content: 'export function DiffViewer() {' },
          { type: 'add', newLineNumber: 5, content: '  return (' },
          { type: 'add', newLineNumber: 6, content: '    <div className="diff-viewer">' },
          { type: 'add', newLineNumber: 7, content: '      <h2>Diff Viewer</h2>' },
          { type: 'add', newLineNumber: 8, content: '      {/* TODO: Implement diff display */}' },
          { type: 'add', newLineNumber: 9, content: '    </div>' },
          { type: 'add', newLineNumber: 10, content: '  )' },
          { type: 'add', newLineNumber: 11, content: '}' }
        ]
      }
    ]
  },
  {
    path: 'src/utils/helpers.ts',
    status: 'modified',
    binary: false,
    hunks: [
      {
        id: 'hunk-2',
        oldStart: 10,
        oldLines: 3,
        newStart: 10,
        newLines: 5,
        header: '@@ -10,3 +10,5 @@ export function formatDate(date: Date) {',
        reviewStatus: 'reviewed',
        lines: [
          { type: 'context', oldLineNumber: 10, newLineNumber: 10, content: 'export function formatDate(date: Date) {' },
          { type: 'delete', oldLineNumber: 11, content: '  return date.toLocaleDateString()' },
          { type: 'add', newLineNumber: 11, content: '  return date.toLocaleDateString("en-US", {' },
          { type: 'add', newLineNumber: 12, content: '    year: "numeric",' },
          { type: 'add', newLineNumber: 13, content: '    month: "short",' },
          { type: 'add', newLineNumber: 14, content: '    day: "numeric"' },
          { type: 'add', newLineNumber: 15, content: '  })' },
          { type: 'context', oldLineNumber: 12, newLineNumber: 16, content: '}' }
        ]
      }
    ]
  },
  {
    path: 'docs/old-readme.md',
    status: 'deleted',
    binary: false,
    hunks: [
      {
        id: 'hunk-3',
        oldStart: 1,
        oldLines: 5,
        newStart: 0,
        newLines: 0,
        header: '@@ -1,5 +0,0 @@ # Old README',
        reviewStatus: 'unreviewed',
        lines: [
          { type: 'delete', oldLineNumber: 1, content: '# Old README' },
          { type: 'delete', oldLineNumber: 2, content: '' },
          { type: 'delete', oldLineNumber: 3, content: 'This file is no longer needed.' },
          { type: 'delete', oldLineNumber: 4, content: '' },
          { type: 'delete', oldLineNumber: 5, content: 'See new documentation in docs/' }
        ]
      }
    ]
  }
]

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
  },

  loadMockData: () => {
    set({
      currentFiles: mockFiles,
      repositoryPath: '/path/to/repo',
      baseCommit: 'HEAD~1',
      targetCommit: 'HEAD',
      loading: false,
      error: null,
      notes: mockNotes
    })
  }
}))