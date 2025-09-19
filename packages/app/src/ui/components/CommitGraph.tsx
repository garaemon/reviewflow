import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, GitBranch as GitBranchIcon, GitCommit as GitCommitIcon, Calendar, User, Check } from 'lucide-react'
import type { GitCommit, GitBranch, CommitGraph } from '@reviewflow/shared'
import { useSettingsStore } from '../store/settingsStore'

interface CommitGraphProps {
  repositoryPath: string
  onCommitSelect: (baseCommit: string, targetCommit: string) => void
  selectedCommits?: { base?: string; target?: string }
}

export function CommitGraph({ repositoryPath, onCommitSelect, selectedCommits }: CommitGraphProps) {
  const [commitGraph, setCommitGraph] = useState<CommitGraph | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedBase, setSelectedBase] = useState<string | null>(selectedCommits?.base || null)
  const [selectedTarget, setSelectedTarget] = useState<string | null>(selectedCommits?.target || null)
  const { darkMode } = useSettingsStore()

  const loadCommitGraph = useCallback(async () => {
    if (!repositoryPath) return

    setLoading(true)
    setError(null)

    try {
      const encodedPath = encodeURIComponent(repositoryPath)
      const response = await fetch(`/api/git/commits/${encodedPath}?maxCount=30`)

      if (!response.ok) {
        throw new Error(`Failed to fetch commit graph: ${response.statusText}`)
      }

      const data = await response.json()
      setCommitGraph(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [repositoryPath])

  useEffect(() => {
    loadCommitGraph()
  }, [loadCommitGraph])

  const handleCommitClick = (commit: GitCommit) => {
    if (!selectedBase) {
      setSelectedBase(commit.hash)
    } else if (!selectedTarget) {
      if (commit.hash !== selectedBase) {
        setSelectedTarget(commit.hash)
        onCommitSelect(selectedBase, commit.hash)
      }
    } else {
      // Reset and start new selection
      setSelectedBase(commit.hash)
      setSelectedTarget(null)
    }
  }

  const resetSelection = () => {
    setSelectedBase(null)
    setSelectedTarget(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCurrentBranch = (): string => {
    const currentBranch: GitBranch | undefined = commitGraph?.branches.find(branch => branch.current)
    return currentBranch?.name || 'main'
  }

  const getCommitStyle = (commit: GitCommit) => {
    const isBase = selectedBase === commit.hash
    const isTarget = selectedTarget === commit.hash
    const isSelected = isBase || isTarget

    if (isSelected) {
      return isBase
        ? `ring-2 ring-blue-500 ${darkMode ? 'bg-blue-900' : 'bg-blue-50'}`
        : `ring-2 ring-green-500 ${darkMode ? 'bg-green-900' : 'bg-green-50'}`
    }

    return darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-3" />
        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading commit history...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center">
          <GitCommitIcon className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-600 font-medium">Failed to load commit history</span>
        </div>
        <p className={`mt-1 text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
        <button
          onClick={loadCommitGraph}
          className={`mt-2 px-3 py-1 text-sm rounded ${darkMode ? 'bg-red-800 hover:bg-red-700 text-red-100' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!commitGraph || commitGraph.commits.length === 0) {
    return (
      <div className="text-center py-8">
        <GitCommitIcon className={`h-8 w-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'} mx-auto mb-2`} />
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No commits found</p>
      </div>
    )
  }

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <GitBranchIcon className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Commit History ({getCurrentBranch()})
            </h3>
          </div>
          <button
            onClick={loadCommitGraph}
            className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title="Refresh commit history"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {(selectedBase || selectedTarget) && (
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm">
              {selectedBase && !selectedTarget && (
                <span className={`${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  Base selected: {selectedBase.substring(0, 7)} - Select target commit
                </span>
              )}
              {selectedBase && selectedTarget && (
                <span className={`${darkMode ? 'text-green-300' : 'text-green-600'} flex items-center`}>
                  <Check className="w-4 h-4 mr-1" />
                  Comparing {selectedBase.substring(0, 7)}..{selectedTarget.substring(0, 7)}
                </span>
              )}
            </div>
            <button
              onClick={resetSelection}
              className={`text-sm px-2 py-1 rounded ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Commit List */}
      <div className="max-h-96 overflow-y-auto">
        {commitGraph.commits.map((commit, index) => (
          <div
            key={commit.hash}
            onClick={() => handleCommitClick(commit)}
            className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} cursor-pointer transition-colors ${getCommitStyle(commit)}`}
          >
            <div className="flex items-start space-x-3">
              {/* Commit graph line */}
              <div className="flex flex-col items-center pt-1">
                <div className={`w-3 h-3 rounded-full ${selectedBase === commit.hash ? 'bg-blue-500' : selectedTarget === commit.hash ? 'bg-green-500' : darkMode ? 'bg-gray-500' : 'bg-gray-400'}`} />
                {index < commitGraph.commits.length - 1 && (
                  <div className={`w-0.5 h-6 mt-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                )}
              </div>

              {/* Commit info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                    {commit.subject}
                  </p>
                  <code className={`text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>
                    {commit.shortHash}
                  </code>
                </div>

                <div className={`mt-1 flex items-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} space-x-4`}>
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {commit.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(commit.date)}
                  </div>
                </div>

                {commit.refs && (
                  <div className="mt-2">
                    {commit.refs.split(', ').map((ref, refIndex) => (
                      <span
                        key={refIndex}
                        className={`inline-block px-2 py-1 text-xs rounded mr-2 ${
                          ref.includes('origin/')
                            ? darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'
                            : darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={`px-4 py-2 text-xs ${darkMode ? 'text-gray-500 bg-gray-900' : 'text-gray-600 bg-gray-50'} rounded-b-lg`}>
        Click commits to select base → target for comparison
      </div>
    </div>
  )
}