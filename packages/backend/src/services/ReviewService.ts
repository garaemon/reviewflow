import type { ReviewNote, ReviewStatus, FileDiff } from '@reviewflow/shared'
import { generateId } from '@reviewflow/shared'
import { GitService } from './GitService'

export class ReviewService {
  constructor() {
    // No database needed anymore
  }

  async getDiff(params: {
    repositoryPath: string
    baseCommit: string
    targetCommit: string
  }): Promise<FileDiff[]> {
    const { repositoryPath, baseCommit, targetCommit } = params
    const gitService = new GitService(repositoryPath)
    return await gitService.getDiff(baseCommit, targetCommit)
  }

  async getUncommittedDiff(repositoryPath: string): Promise<FileDiff[]> {
    const gitService = new GitService(repositoryPath)
    return await gitService.getUncommittedDiff()
  }




}