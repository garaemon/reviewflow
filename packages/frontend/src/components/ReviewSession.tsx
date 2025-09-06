import { useEffect, useState } from 'react'
import { RefreshCw, GitCommit, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useReviewStore } from '../store/reviewStore'
import { FileViewer } from './FileViewer'
import type { ReviewStatus } from '@reviewflow/shared'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (content: string, type: 'memo' | 'comment') => void
  hunkId: string
  lineNumber?: number
}

function NoteModal({ isOpen, onClose, onSave, hunkId, lineNumber }: NoteModalProps) {
  const [content, setContent] = useState('')
  const [type, setType] = useState<'memo' | 'comment'>('memo')

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim(), type)
      setContent('')
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
        <h3 className="text-lg font-medium text-white mb-4">
          Add {type} {lineNumber && `(Line ${lineNumber})`}
        </h3>
        
        <div className="mb-4">
          <div className="flex space-x-4 mb-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="noteType"
                value="memo"
                checked={type === 'memo'}
                onChange={(e) => setType(e.target.value as 'memo' | 'comment')}
                className="mr-2"
              />
              <span className="text-gray-300">Personal Memo</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="noteType"
                value="comment"
                checked={type === 'comment'}
                onChange={(e) => setType(e.target.value as 'memo' | 'comment')}
                className="mr-2"
              />
              <span className="text-gray-300">Review Comment</span>
            </label>
          </div>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={type === 'memo' ? 'Personal notes...' : 'Review feedback...'}
            className="w-full h-32 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Press Escape to cancel, Ctrl+Enter to save
          </p>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors"
            >
              Save {type}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ReviewSession() {
  const { 
    currentSession, 
    loading, 
    error,
    notes,
    updateHunkStatus, 
    addNote,
    loadMockSession 
  } = useReviewStore()
  
  const [noteModal, setNoteModal] = useState<{
    isOpen: boolean
    hunkId: string
    lineNumber?: number
  }>({ isOpen: false, hunkId: '' })

  useEffect(() => {
    // Load mock session for development
    loadMockSession()
  }, [loadMockSession])

  const handleStatusChange = async (hunkId: string, status: ReviewStatus) => {
    await updateHunkStatus(hunkId, status)
  }

  const handleAddNote = (hunkId: string, lineNumber?: number) => {
    setNoteModal({ isOpen: true, hunkId, lineNumber })
  }

  const handleSaveNote = async (content: string, type: 'memo' | 'comment') => {
    await addNote(noteModal.hunkId, content, type, noteModal.lineNumber)
    setNoteModal({ isOpen: false, hunkId: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-300">Loading review session...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
        <div className="text-red-400">
          <p className="font-medium">Failed to load review session</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!currentSession) {
    return (
      <div className="text-center py-12">
        <GitCommit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          No review session active
        </h3>
        <p className="text-gray-500">
          Start a review session using the CLI: <code className="bg-gray-800 px-2 py-1 rounded">review start</code>
        </p>
      </div>
    )
  }

  const totalHunks = currentSession.files.reduce((sum, file) => sum + file.hunks.length, 0)
  const reviewedHunks = currentSession.files.reduce((sum, file) => 
    sum + file.hunks.filter(hunk => hunk.reviewStatus === 'reviewed').length, 0)
  const notedHunks = currentSession.files.reduce((sum, file) => 
    sum + file.hunks.filter(hunk => hunk.reviewStatus === 'noted').length, 0)

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Code Review Session</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" title="Last updated" />
              {new Date(currentSession.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-700 rounded p-3">
            <div className="text-gray-400 text-xs uppercase">Repository</div>
            <div className="font-mono text-sm text-white truncate">
              {currentSession.repositoryPath}
            </div>
          </div>
          <div className="bg-gray-700 rounded p-3">
            <div className="text-gray-400 text-xs uppercase">Range</div>
            <div className="font-mono text-sm text-white">
              {currentSession.baseCommit}..{currentSession.targetCommit}
            </div>
          </div>
          <div className="bg-gray-700 rounded p-3">
            <div className="text-gray-400 text-xs uppercase">Files Changed</div>
            <div className="text-sm text-white">
              {currentSession.files.length} files
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-white">Review Progress</h3>
            <div className="text-sm text-gray-300">
              {reviewedHunks} / {totalHunks} hunks reviewed
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" title="Reviewed and approved hunks" />
              <span className="text-gray-300">{reviewedHunks} reviewed</span>
            </div>
            <div className="flex items-center text-sm">
              <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" title="Hunks with notes or comments" />
              <span className="text-gray-300">{notedHunks} noted</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 text-gray-500 mr-1" title="Hunks awaiting review" />
              <span className="text-gray-300">{totalHunks - reviewedHunks - notedHunks} pending</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${totalHunks > 0 ? (reviewedHunks / totalHunks) * 100 : 0}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* File List */}
      {currentSession.files.map((file) => (
        <FileViewer
          key={file.path}
          file={file}
          notes={notes}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
        />
      ))}

      {/* Note Modal */}
      <NoteModal
        isOpen={noteModal.isOpen}
        onClose={() => setNoteModal({ isOpen: false, hunkId: '' })}
        onSave={handleSaveNote}
        hunkId={noteModal.hunkId}
        lineNumber={noteModal.lineNumber}
      />
    </div>
  )
}