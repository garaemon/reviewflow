import { useState } from 'react'
import { ChevronDown, ChevronRight, Check, MessageSquare, StickyNote, User, FileText } from 'lucide-react'
import type { DiffHunk, DiffLine, ReviewStatus, ReviewNote } from '@reviewflow/shared'
import { useSettingsStore } from '../store/settingsStore'

interface DiffViewerProps {
  hunks: DiffHunk[]
  notes: Record<string, ReviewNote[]>
  onStatusChange: (hunkId: string, status: ReviewStatus) => void
  onAddNote: (hunkId: string, lineNumber?: number) => void
}

interface DiffLineProps {
  line: DiffLine
  lineIndex: number
  hunkId: string
  notes: ReviewNote[]
  onAddNote: (hunkId: string, lineNumber?: number) => void
}

function DiffLineComponent({ line, lineIndex, hunkId, notes, onAddNote }: DiffLineProps) {
  const getLineClass = () => {
    switch (line.type) {
      case 'add':
        return 'bg-green-900/30 border-green-700/50'
      case 'delete':
        return 'bg-red-900/30 border-red-700/50'
      default:
        return 'bg-gray-800/50 border-gray-700/50'
    }
  }

  const getLineSymbol = () => {
    switch (line.type) {
      case 'add':
        return '+'
      case 'delete':
        return '-'
      default:
        return ' '
    }
  }

  // この行に関連するコメントを取得
  const lineNumber = line.newLineNumber || line.oldLineNumber
  const lineNotes = notes.filter(note => note.lineNumber === lineNumber)

  return (
    <div>
      {/* コード行 */}
      <div className={`flex group hover:bg-gray-750 ${getLineClass()} border-l-2`}>
        <div className="flex-none w-12 px-2 py-1 text-xs text-gray-500 text-right">
          {line.oldLineNumber || ''}
        </div>
        <div className="flex-none w-12 px-2 py-1 text-xs text-gray-500 text-right border-r border-gray-700">
          {line.newLineNumber || ''}
        </div>
        <div className="flex-none w-6 px-1 py-1 text-xs text-center font-mono text-gray-400">
          {getLineSymbol()}
        </div>
        <div className="flex-1 px-2 py-1 font-mono text-sm text-white whitespace-pre">
          {line.content}
        </div>
        <div className="flex-none opacity-0 group-hover:opacity-100 px-2 py-1">
          <button
            onClick={() => onAddNote(hunkId, line.newLineNumber || line.oldLineNumber)}
            className="text-gray-400 hover:text-blue-400 transition-colors"
            title={`Add note to line ${line.newLineNumber || line.oldLineNumber}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* インラインコメント */}
      {lineNotes.map((note) => (
        <div
          key={note.id}
          className="border-l-2 border-gray-600 ml-6"
        >
          <div className={`mx-6 my-2 p-3 rounded-lg border ${
            note.type === 'memo' 
              ? 'bg-blue-900/30 border-blue-700/50' 
              : 'bg-yellow-900/30 border-yellow-700/50'
          }`}>
            <div className="flex items-start">
              <div className="flex-none mr-3 mt-1">
                {note.type === 'memo' ? (
                  <StickyNote className="w-4 h-4 text-blue-400" />
                ) : (
                  <MessageSquare className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">
                    {note.type === 'memo' ? 'Personal memo' : 'Review comment'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-200 whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface HunkViewerProps {
  hunk: DiffHunk
  notes: ReviewNote[]
  onStatusChange: (hunkId: string, status: ReviewStatus) => void
  onAddNote: (hunkId: string, lineNumber?: number) => void
}

function HunkViewer({ hunk, notes, onStatusChange, onAddNote }: HunkViewerProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleReviewStatus = () => {
    const newStatus: ReviewStatus = hunk.reviewStatus === 'reviewed' ? 'unreviewed' : 'reviewed'
    onStatusChange(hunk.id, newStatus)
  }

  const hunkNotes = notes.filter(note => !note.lineNumber)

  return (
    <div className="border border-gray-700 rounded-lg mb-4 overflow-hidden">
      {/* Hunk Header */}
      <div className="bg-gray-800 px-4 py-3">
        <div className="flex items-center space-x-3 mb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors"
            title={isExpanded ? "Collapse this hunk" : "Expand this hunk"}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          <code className="text-sm text-gray-300 font-mono">
            {hunk.header}
          </code>
          <span className="text-xs text-gray-500">
            {hunk.lines.length} lines
          </span>

          {/* Review Status and Actions */}
          <div className="flex-1 flex items-center justify-end space-x-2">
            {/* Review Status Indicator */}
            <div className={`flex items-center px-2 py-1 rounded text-white text-xs ${
              hunk.reviewStatus === 'reviewed' ? 'bg-green-600' : 'bg-gray-600'
            }`}>
              {hunk.reviewStatus === 'reviewed' && <Check className="w-4 h-4 mr-1" />}
              <span className="capitalize">{hunk.reviewStatus}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-1">
              {/* Review Toggle Button */}
              <button
                onClick={toggleReviewStatus}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  hunk.reviewStatus === 'reviewed'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
                }`}
                title={hunk.reviewStatus === 'reviewed' ? "Mark as unreviewed" : "Mark as reviewed"}
              >
                ✓
              </button>
              {/* Note Button */}
              <button
                onClick={() => onAddNote(hunk.id)}
                className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white transition-colors"
                title="Add a note to this hunk"
              >
                📝
              </button>
            </div>
          </div>
        </div>

        {/* Hunk Notes Display */}
        {hunkNotes.length > 0 && (
          <div className="mt-2 space-y-2">
            {hunkNotes.map((note) => (
              <div
                key={note.id}
                className={`p-2 rounded border text-sm ${
                  note.type === 'memo' 
                    ? 'bg-blue-900/20 border-blue-700/30 text-blue-200' 
                    : 'bg-yellow-900/20 border-yellow-700/30 text-yellow-200'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-none mr-2 mt-0.5">
                    {note.type === 'memo' ? (
                      <StickyNote className="w-3 h-3" />
                    ) : (
                      <MessageSquare className="w-3 h-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap">{note.content}</p>
                    <span className="text-xs opacity-75">
                      {new Date(note.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hunk Content */}
      {isExpanded && (
        <div className="bg-gray-900">
          {hunk.lines.map((line, index) => (
            <DiffLineComponent
              key={index}
              line={line}
              lineIndex={index}
              hunkId={hunk.id}
              notes={notes}
              onAddNote={onAddNote}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function DiffViewer({ hunks, notes, onStatusChange, onAddNote }: DiffViewerProps) {
  const { viewMode, contextLines } = useSettingsStore()

  const reviewedCount = hunks.filter(h => h.reviewStatus === 'reviewed').length
  const totalCount = hunks.length

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-white">Review Progress</h3>
          <span className="text-sm text-gray-300">
            {reviewedCount} / {totalCount} hunks reviewed
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalCount > 0 ? (reviewedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Hunks */}
      {hunks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No changes to review
        </div>
      ) : (
        hunks.map((hunk) => (
          <HunkViewer
            key={hunk.id}
            hunk={hunk}
            notes={notes[hunk.id] || []}
            onStatusChange={onStatusChange}
            onAddNote={onAddNote}
          />
        ))
      )}
    </div>
  )
}