import simpleGit, { SimpleGit } from 'simple-git'
import { parsePatch } from 'diff'
import type { FileDiff, DiffHunk, DiffLine } from '@reviewflow/shared'
import { generateId } from '@reviewflow/shared'

export class GitService {
  private git: SimpleGit

  constructor(repositoryPath: string) {
    this.git = simpleGit(repositoryPath)
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
          header: hunk.header || '',
          lines,
          reviewStatus: 'pending'
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