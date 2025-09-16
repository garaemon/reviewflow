export interface DiffHunk {
  id: string
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  header: string
  lines: DiffLine[]
  reviewStatus: ReviewStatus
}

export interface DiffLine {
  type: 'add' | 'delete' | 'context'
  oldLineNumber?: number
  newLineNumber?: number
  content: string
}

export interface FileDiff {
  path: string
  oldPath?: string
  status: 'added' | 'deleted' | 'modified' | 'renamed'
  hunks: DiffHunk[]
  binary: boolean
}

export interface ReviewSession {
  id: string
  repositoryPath: string
  baseCommit: string
  targetCommit: string
  createdAt: string
  updatedAt: string
  files: FileDiff[]
}

export type ReviewStatus = 'reviewed' | 'unreviewed'

export interface ReviewNote {
  id: string
  hunkId: string
  lineNumber?: number
  type: 'memo' | 'comment'
  content: string
  createdAt: string
  updatedAt: string
}

export interface ReviewConfig {
  contextLines: number
  showWhitespace: boolean
  darkMode: boolean
  viewMode: 'unified' | 'split'
}

export interface GitCommit {
  hash: string
  shortHash: string
  author: string
  date: string
  message: string
  subject: string
  refs?: string
  parentHashes: string[]
}

export interface GitBranch {
  name: string
  current: boolean
  remote?: string
}

export interface CommitGraph {
  commits: GitCommit[]
  branches: GitBranch[]
}