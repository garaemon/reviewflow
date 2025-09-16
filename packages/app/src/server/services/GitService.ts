import simpleGit, { SimpleGit } from 'simple-git'
import { parsePatch } from 'diff'
import type { FileDiff, DiffHunk, DiffLine, GitCommit, GitBranch, CommitGraph } from '@shared/types/index.js'
import { generateId } from '@shared/utils/index.js'

export class GitService {
  private git: SimpleGit

  constructor(repositoryPath: string) {
    // For development, use current working directory if path is a placeholder
    const actualPath = repositoryPath === '/path/to/repo'
      ? process.cwd()
      : repositoryPath
    this.git = simpleGit(actualPath)
  }

  async getDiff(baseCommit: string, targetCommit: string): Promise<FileDiff[]> {
    const diffText = await this.git.diff([`${baseCommit}..${targetCommit}`, '--unified=3'])
    return this.parseDiffText(diffText)
  }

  async getStatus() {
    const status = await this.git.status()
    return {
      current: status.current,
      tracking: status.tracking,
      ahead: status.ahead,
      behind: status.behind,
      files: status.files
    }
  }

  async getCommitGraph(maxCount: number = 50): Promise<CommitGraph> {
    const [commits, branches] = await Promise.all([
      this.getCommitHistory(maxCount),
      this.getBranches()
    ])

    return {
      commits,
      branches
    }
  }

  async getCommitHistory(maxCount: number = 50): Promise<GitCommit[]> {
    const log = await this.git.log({
      maxCount
    })

    return log.all.map(commit => ({
      hash: commit.hash,
      shortHash: commit.hash.substring(0, 7),
      author: commit.author_name,
      date: commit.date,
      message: commit.message,
      subject: commit.message.split('\n')[0],
      refs: commit.refs || undefined,
      parentHashes: []
    }))
  }

  async getBranches(): Promise<GitBranch[]> {
    const branches = await this.git.branch(['-a'])

    return Object.entries(branches.branches).map(([name, branch]) => ({
      name: name.replace(/^remotes\//, ''),
      current: branch.current,
      remote: name.startsWith('remotes/') ? name.split('/')[1] : undefined
    }))
  }

  private parseDiffText(diffText: string): FileDiff[] {
    const patches = parsePatch(diffText)
    const fileDiffs: FileDiff[] = []

    for (const patch of patches) {
      const hunks: DiffHunk[] = []

      for (const hunk of patch.hunks) {
        const lines: DiffLine[] = []
        
        for (const line of hunk.lines) {
          const type = line.startsWith('+') ? 'add' : 
                      line.startsWith('-') ? 'delete' : 'context'
          
          lines.push({
            type,
            content: line.substring(1),
            oldLineNumber: type === 'add' ? undefined : hunk.oldStart + lines.filter(l => l.type !== 'add').length,
            newLineNumber: type === 'delete' ? undefined : hunk.newStart + lines.filter(l => l.type !== 'delete').length
          })
        }

        hunks.push({
          id: generateId(),
          oldStart: hunk.oldStart,
          oldLines: hunk.oldLines,
          newStart: hunk.newStart,
          newLines: hunk.newLines,
          header: `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`,
          lines,
          reviewStatus: 'unreviewed'
        })
      }

      const fileDiff: FileDiff = {
        path: patch.newFileName || patch.oldFileName || '',
        oldPath: patch.oldFileName !== patch.newFileName ? patch.oldFileName : undefined,
        status: this.getFileStatus(patch),
        hunks,
        binary: false
      }

      fileDiffs.push(fileDiff)
    }

    return fileDiffs
  }

  private getFileStatus(patch: any): 'added' | 'deleted' | 'modified' | 'renamed' {
    if (!patch.oldFileName) return 'added'
    if (!patch.newFileName) return 'deleted'
    if (patch.oldFileName !== patch.newFileName) return 'renamed'
    return 'modified'
  }
}