import { useState } from 'react'
import { ChevronDown, ChevronRight, Check, MessageSquare, StickyNote } from 'lucide-react'
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
  hunkId: string
  notes: ReviewNote[]
  onAddNote: (hunkId: string, lineNumber?: number) => void
}

function DiffLineComponent({ line, hunkId, notes, onAddNote }: DiffLineProps) {
  const { darkMode, viewMode } = useSettingsStore()
  
  const getLineClass = () => {
    switch (line.type) {
      case 'add':
        return darkMode ? 'bg-green-900/30 border-green-700/50' : 'bg-green-100 border-green-300'
      case 'delete':
        return darkMode ? 'bg-red-900/30 border-red-700/50' : 'bg-red-100 border-red-300'
      default:
        return darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-50 border-gray-200'
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

  // Split view rendering
  if (viewMode === 'split') {
    return (
      <div className="flex">
        {/* Old line (left side) */}
        <div className={`flex-1 ${line.type === 'delete' ? getLineClass() : darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          <div className={`flex group ${darkMode ? 'hover:bg-gray-750' : 'hover:bg-blue-50'}`}>
            <div className={`flex-none w-6 px-1 py-0.25 text-3xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} text-right`}>
              {line.type !== 'add' ? (line.oldLineNumber || '') : ''}
            </div>
            <div className={`flex-none w-4 px-0.5 py-0.25 text-3xs text-center font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {line.type === 'delete' ? '-' : ' '}
            </div>
            <div className={`flex-1 px-1 py-0.25 font-mono text-2xs leading-extra-tight ${darkMode ? 'text-white' : 'text-gray-900'} whitespace-pre-wrap break-all overflow-hidden`}>
              {line.type !== 'add' ? line.content : ''}
            </div>
          </div>
        </div>
        
        {/* New line (right side) */}
        <div className={`flex-1 ${line.type === 'add' ? getLineClass() : darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className={`flex group ${darkMode ? 'hover:bg-gray-750' : 'hover:bg-blue-50'}`}>
            <div className={`flex-none w-6 px-1 py-0.25 text-3xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} text-right`}>
              {line.type !== 'delete' ? (line.newLineNumber || '') : ''}
            </div>
            <div className={`flex-none w-4 px-0.5 py-0.25 text-3xs text-center font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {line.type === 'add' ? '+' : ' '}
            </div>
            <div className={`flex-1 px-1 py-0.25 font-mono text-2xs leading-extra-tight ${darkMode ? 'text-white' : 'text-gray-900'} whitespace-pre-wrap break-all overflow-hidden`}>
              {line.type !== 'delete' ? line.content : ''}
            </div>
            <div className="flex-none opacity-0 group-hover:opacity-100 px-1 py-0.25">
              <button
                onClick={() => onAddNote(hunkId, line.newLineNumber || line.oldLineNumber)}
                className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'} transition-colors`}
                title={`Add note to line ${line.newLineNumber || line.oldLineNumber}`}
              >
                <MessageSquare className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Unified view rendering (default)
  return (
    <div>
      {/* コード行 */}
      <div className={`flex group ${darkMode ? 'hover:bg-gray-750' : 'hover:bg-blue-50'} ${getLineClass()} border-l-2`}>
        <div className={`flex-none w-6 px-1 py-0.25 text-3xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} text-right`}>
          {line.oldLineNumber || ''}
        </div>
        <div className={`flex-none w-6 px-1 py-0.25 text-3xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} text-right border-r ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          {line.newLineNumber || ''}
        </div>
        <div className={`flex-none w-4 px-0.5 py-0.25 text-3xs text-center font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {getLineSymbol()}
        </div>
        <div className={`flex-1 px-1 py-0.25 font-mono text-2xs leading-extra-tight ${darkMode ? 'text-white' : 'text-gray-900'} whitespace-pre-wrap break-all overflow-hidden`}>
          {line.content}
        </div>
        <div className="flex-none opacity-0 group-hover:opacity-100 px-1 py-0.25">
          <button
            onClick={() => onAddNote(hunkId, line.newLineNumber || line.oldLineNumber)}
            className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'} transition-colors`}
            title={`Add note to line ${line.newLineNumber || line.oldLineNumber}`}
          >
            <MessageSquare className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* インラインコメント */}
      {lineNotes.map((note) => (
        <div
          key={note.id}
          className="border-l-2 border-gray-600 ml-4"
        >
          <div className={`mx-4 my-1 p-2 rounded border ${
            note.type === 'memo' 
              ? 'bg-blue-900/30 border-blue-700/50' 
              : 'bg-yellow-900/30 border-yellow-700/50'
          }`}>
            <div className="flex items-start">
              <div className="flex-none mr-2 mt-0.5">
                {note.type === 'memo' ? (
                  <StickyNote className="w-3 h-3 text-blue-400" />
                ) : (
                  <MessageSquare className="w-3 h-3 text-yellow-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-3xs text-gray-400">
                    {note.type === 'memo' ? 'Personal memo' : 'Review comment'}
                  </span>
                  <span className="text-3xs text-gray-500">
                    {new Date(note.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-2xs text-gray-200 whitespace-pre-wrap">
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
  const { darkMode } = useSettingsStore()

  const toggleReviewStatus = () => {
    const newStatus: ReviewStatus = hunk.reviewStatus === 'reviewed' ? 'unreviewed' : 'reviewed'
    onStatusChange(hunk.id, newStatus)
  }

  const hunkNotes = notes.filter(note => !note.lineNumber)

  return (
    <div className={`border ${darkMode ? 'border-gray-700' : 'border-gray-300'} rounded mb-2 overflow-hidden`}>
      {/* Hunk Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} px-2 py-1.5`}>
        <div className="flex items-center space-x-2 mb-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            title={isExpanded ? "Collapse this hunk" : "Expand this hunk"}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
          <code className={`text-2xs ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-mono`}>
            {hunk.header}
          </code>
          <span className={`text-3xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            {hunk.lines.length} lines
          </span>

          {/* Review Status and Actions */}
          <div className="flex-1 flex items-center justify-end space-x-2">
            {/* Review Status Indicator */}
            <div className={`flex items-center px-1 py-0.5 rounded text-white text-3xs ${
              hunk.reviewStatus === 'reviewed' ? 'bg-green-600' : 'bg-gray-600'
            }`}>
              {hunk.reviewStatus === 'reviewed' && <Check className="w-3 h-3 mr-0.5" />}
              <span className="capitalize">{hunk.reviewStatus}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-0.5">
              {/* Review Toggle Button */}
              <button
                onClick={toggleReviewStatus}
                className={`px-1 py-0.5 rounded text-3xs transition-colors ${
                  hunk.reviewStatus === 'reviewed'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
                      : 'bg-gray-300 text-gray-700 hover:bg-green-600 hover:text-white'
                }`}
                title={hunk.reviewStatus === 'reviewed' ? "Mark as unreviewed" : "Mark as reviewed"}
              >
                ✓
              </button>
              {/* Note Button */}
              <button
                onClick={() => onAddNote(hunk.id)}
                className={`px-1 py-0.5 rounded text-3xs transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white'
                    : 'bg-gray-300 text-gray-700 hover:bg-blue-600 hover:text-white'
                }`}
                title="Add a note to this hunk"
              >
                📝
              </button>
            </div>
          </div>
        </div>

        {/* Hunk Notes Display */}
        {hunkNotes.length > 0 && (
          <div className="mt-1 space-y-1">
            {hunkNotes.map((note) => (
              <div
                key={note.id}
                className={`p-1 rounded border text-2xs ${
                  note.type === 'memo' 
                    ? 'bg-blue-900/20 border-blue-700/30 text-blue-200' 
                    : 'bg-yellow-900/20 border-yellow-700/30 text-yellow-200'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-none mr-1 mt-0.25">
                    {note.type === 'memo' ? (
                      <StickyNote className="w-3 h-3" />
                    ) : (
                      <MessageSquare className="w-3 h-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap">{note.content}</p>
                    <span className="text-3xs opacity-75">
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
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          {hunk.lines.map((line, index) => (
            <DiffLineComponent
              key={index}
              line={line}
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
  const { darkMode } = useSettingsStore()

  return (
    <div className="space-y-2">
      {/* Hunks */}
      {hunks.length === 0 ? (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
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