import { useState } from 'react'
import { ChevronDown, ChevronRight, File, FileText, Plus, Minus, GitBranch } from 'lucide-react'
import type { FileDiff, ReviewStatus, ReviewNote } from '@reviewflow/shared'
import { DiffViewer } from './DiffViewer'

interface FileViewerProps {
  file: FileDiff
  notes: Record<string, ReviewNote[]>
  onStatusChange: (hunkId: string, status: ReviewStatus) => void
  onAddNote: (hunkId: string, lineNumber?: number) => void
}

function getFileIcon(status: FileDiff['status']) {
  switch (status) {
    case 'added':
      return <Plus className="w-4 h-4 text-green-500" title="New file added" />
    case 'deleted':
      return <Minus className="w-4 h-4 text-red-500" title="File deleted" />
    case 'renamed':
      return <GitBranch className="w-4 h-4 text-blue-500" title="File renamed or moved" />
    case 'modified':
    default:
      return <FileText className="w-4 h-4 text-gray-400" title="File modified" />
  }
}

function getStatusColor(status: FileDiff['status']) {
  switch (status) {
    case 'added':
      return 'text-green-500'
    case 'deleted':
      return 'text-red-500'
    case 'renamed':
      return 'text-blue-500'
    case 'modified':
    default:
      return 'text-gray-300'
  }
}

export function FileViewer({ file, notes, onStatusChange, onAddNote }: FileViewerProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const addedLines = file.hunks.reduce((sum, hunk) => 
    sum + hunk.lines.filter(line => line.type === 'add').length, 0)
  
  const deletedLines = file.hunks.reduce((sum, hunk) => 
    sum + hunk.lines.filter(line => line.type === 'delete').length, 0)

  const reviewedHunks = file.hunks.filter(hunk => hunk.reviewStatus === 'reviewed').length
  const totalHunks = file.hunks.length

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden mb-6">
      {/* File Header */}
      <div className="bg-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors"
              title={isExpanded ? "Collapse file diff" : "Expand file diff"}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {getFileIcon(file.status)}

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className={`font-mono text-sm ${getStatusColor(file.status)}`}>
                  {file.path}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  ({file.status})
                </span>
              </div>
              
              {file.oldPath && file.oldPath !== file.path && (
                <span className="text-xs text-gray-500 font-mono">
                  {file.oldPath} → {file.path}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            {/* File Stats */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-green-500">+{addedLines}</span>
              <span className="text-red-500">-{deletedLines}</span>
              <span className="text-gray-400">
                {totalHunks} {totalHunks === 1 ? 'hunk' : 'hunks'}
              </span>
            </div>

            {/* Review Progress */}
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-400">
                {reviewedHunks}/{totalHunks} reviewed
              </div>
              <div className="w-12 bg-gray-700 rounded-full h-1">
                <div
                  className="bg-green-600 h-1 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${totalHunks > 0 ? (reviewedHunks / totalHunks) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Content */}
      {isExpanded && (
        <div className="bg-gray-900">
          {file.binary ? (
            <div className="p-8 text-center text-gray-500">
              <File className="w-12 h-12 mx-auto mb-3" />
              <p>Binary file cannot be displayed</p>
            </div>
          ) : file.hunks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3" />
              <p>No changes in this file</p>
            </div>
          ) : (
            <div className="p-4">
              <DiffViewer
                hunks={file.hunks}
                notes={notes}
                onStatusChange={onStatusChange}
                onAddNote={onAddNote}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}