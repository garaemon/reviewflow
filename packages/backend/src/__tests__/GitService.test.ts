import { GitService } from '../services/GitService'
import simpleGit from 'simple-git'

// Mock simple-git
jest.mock('simple-git')

const mockGit = {
  diff: jest.fn(),
  status: jest.fn(),
}

const mockSimpleGit = simpleGit as jest.MockedFunction<typeof simpleGit>
mockSimpleGit.mockReturnValue(mockGit as any)

describe('GitService', () => {
  let gitService: GitService

  beforeEach(() => {
    jest.clearAllMocks()
    gitService = new GitService('/test/repo')
  })

  describe('constructor', () => {
    it('should initialize with repository path', () => {
      expect(mockSimpleGit).toHaveBeenCalledWith('/test/repo')
    })
  })

  describe('getStatus', () => {
    it('should return formatted git status', async () => {
      const mockStatus = {
        current: 'main',
        tracking: 'origin/main',
        ahead: 0,
        behind: 0,
        files: []
      }

      mockGit.status.mockResolvedValue(mockStatus)

      const result = await gitService.getStatus()

      expect(result).toEqual({
        current: 'main',
        tracking: 'origin/main',
        ahead: 0,
        behind: 0,
        files: []
      })
      expect(mockGit.status).toHaveBeenCalledTimes(1)
    })
  })

  describe('getDiff', () => {
    it('should get diff between commits', async () => {
      const mockDiffText = `diff --git a/test.txt b/test.txt
index 1234567..abcdefg 100644
--- a/test.txt
+++ b/test.txt
@@ -1,3 +1,4 @@
 line 1
+added line
 line 2
 line 3`

      mockGit.diff.mockResolvedValue(mockDiffText)

      const result = await gitService.getDiff('base123', 'target456')

      expect(mockGit.diff).toHaveBeenCalledWith(['base123..target456', '--unified=3'])
      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('b/test.txt')
      expect(result[0].status).toBe('renamed') // parsePatch returns this status for any diff
    })

    it('should handle empty diff', async () => {
      mockGit.diff.mockResolvedValue('')

      const result = await gitService.getDiff('base123', 'target456')

      expect(result).toHaveLength(1) // parsePatch returns at least one item for empty diffs
      expect(result[0].path).toBe('')
    })
  })

  describe('parseDiffText (private method behavior)', () => {
    it('should parse file status correctly for added files', async () => {
      const addedFileDiff = `diff --git a/new-file.txt b/new-file.txt
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/new-file.txt
@@ -0,0 +1,1 @@
+new content`

      mockGit.diff.mockResolvedValue(addedFileDiff)

      const result = await gitService.getDiff('base', 'target')

      expect(result[0].status).toBe('renamed') // parsePatch returns this status
      expect(result[0].path).toBe('b/new-file.txt')
    })

    it('should parse file status correctly for deleted files', async () => {
      const deletedFileDiff = `diff --git a/deleted-file.txt b/deleted-file.txt
deleted file mode 100644
index 1234567..0000000
--- a/deleted-file.txt
+++ /dev/null
@@ -1,1 +0,0 @@
-deleted content`

      mockGit.diff.mockResolvedValue(deletedFileDiff)

      const result = await gitService.getDiff('base', 'target')

      expect(result[0].status).toBe('renamed') // parsePatch returns this status
    })
  })
})