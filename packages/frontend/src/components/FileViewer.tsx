import { useState } from 'react'
import { ChevronDown, ChevronRight, File, FileText, Plus, Minus, GitBranch } from 'lucide-react'
import type { FileDiff, ReviewStatus, ReviewNote } from '@reviewflow/shared'
import { DiffViewer } from './DiffViewer'
import { useSettingsStore } from '../store/settingsStore'

interface FileViewerProps {
  file: FileDiff
  notes: Record<string, ReviewNote[]>
  onStatusChange: (hunkId: string, status: ReviewStatus) => void
  onAddNote: (hunkId: string, lineNumber?: number) => void
}

function getFileIcon(status: FileDiff['status']) {
  switch (status) {
    case 'added':
      return <Plus className="w-4 h-4 text-green-500" aria-label="New file added" />
    case 'deleted':
      return <Minus className="w-4 h-4 text-red-500" aria-label="File deleted" />
    case 'renamed':
      return <GitBranch className="w-4 h-4 text-blue-500" aria-label="File renamed or moved" />
    case 'modified':
    default:
      return <FileText className="w-4 h-4 text-gray-400" aria-label="File modified" />
  }
}

function getStatusColor(status: FileDiff['status'], darkMode: boolean) {
  switch (status) {
    case 'added':
      return 'text-green-500'
    case 'deleted':
      return 'text-red-500'
    case 'renamed':
      return 'text-blue-500'
    case 'modified':
    default:
      return darkMode ? 'text-gray-300' : 'text-gray-700'
  }
}

export function FileViewer({ file, notes, onStatusChange, onAddNote }: FileViewerProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { darkMode } = useSettingsStore()

  const addedLines = file.hunks.reduce((sum, hunk) => 
    sum + hunk.lines.filter(line => line.type === 'add').length, 0)
  
  const deletedLines = file.hunks.reduce((sum, hunk) => 
    sum + hunk.lines.filter(line => line.type === 'delete').length, 0)

  const reviewedHunks = file.hunks.filter(hunk => hunk.reviewStatus === 'reviewed').length
  const totalHunks = file.hunks.length

  return (
    <div className={`border ${darkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg overflow-hidden mb-6`}>
      {/* File Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
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
                <span className={`font-mono text-2xs ${getStatusColor(file.status, darkMode)}`}>
                  {file.path}
                </span>
                <span className={`text-3xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} capitalize`}>
                  ({file.status})
                </span>
                {/* Review Progress inline */}
                <div className="flex items-center space-x-1">
                  <div className={`text-3xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {reviewedHunks}/{totalHunks}
                  </div>
                  <div className={`w-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full h-1`}>
                    <div
                      className="bg-green-600 h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${totalHunks > 0 ? (reviewedHunks / totalHunks) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {file.oldPath && file.oldPath !== file.path && (
                <span className={`text-3xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} font-mono`}>
                  {file.oldPath} → {file.path}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            {/* File Stats */}
            <div className="flex items-center space-x-3 text-3xs">
              <span className="text-green-500">+{addedLines}</span>
              <span className="text-red-500">-{deletedLines}</span>
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {totalHunks} {totalHunks === 1 ? 'hunk' : 'hunks'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* File Content */}
      {isExpanded && (
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          {file.binary ? (
            <div className={`p-8 text-center ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              <File className="w-12 h-12 mx-auto mb-3" />
              <p>Binary file cannot be displayed</p>
            </div>
          ) : file.hunks.length === 0 ? (
            <div className={`p-8 text-center ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
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