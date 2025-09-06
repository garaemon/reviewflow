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

  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case 'reviewed':
        return 'bg-green-600'
      case 'noted':
        return 'bg-yellow-600'
      default:
        return 'bg-gray-600'
    }
  }

  const getStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case 'reviewed':
        return <Check className="w-4 h-4" />
      case 'noted':
        return <StickyNote className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="border border-gray-700 rounded-lg mb-4 overflow-hidden">
      {/* Hunk Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
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
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Indicator */}
          <div className={`flex items-center px-2 py-1 rounded text-white text-xs ${getStatusColor(hunk.reviewStatus)}`}>
            {getStatusIcon(hunk.reviewStatus)}
            <span className="ml-1 capitalize">{hunk.reviewStatus}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-1">
            <button
              onClick={() => onStatusChange(hunk.id, 'reviewed')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                hunk.reviewStatus === 'reviewed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
              }`}
              title="Mark this hunk as reviewed and approved"
            >
              ✓
            </button>
            <button
              onClick={() => onAddNote(hunk.id)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                hunk.reviewStatus === 'noted'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-yellow-600 hover:text-white'
              }`}
              title="Add a note or comment to this hunk"
            >
              📝
            </button>
            <button
              onClick={() => onStatusChange(hunk.id, 'pending')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                hunk.reviewStatus === 'pending'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-500 hover:text-white'
              }`}
              title="Mark this hunk as pending review"
            >
              ⏳
            </button>
          </div>
        </div>
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