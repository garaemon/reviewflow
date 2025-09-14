import { useState } from 'react'
import { Edit3, Check, X, GitBranch } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'

interface RangeSelectorProps {
  currentRange: string
  onRangeChange: (newRange: string) => Promise<void>
  disabled?: boolean
}

export function RangeSelector({ currentRange, onRangeChange, disabled = false }: RangeSelectorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(currentRange)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { darkMode } = useSettingsStore()

  const handleStartEdit = () => {
    setInputValue(currentRange)
    setIsEditing(true)
    setError('')
  }

  const handleCancel = () => {
    setInputValue(currentRange)
    setIsEditing(false)
    setError('')
  }

  const validateRange = (range: string): string | null => {
    if (!range.trim()) {
      return 'Range cannot be empty'
    }

    const trimmedRange = range.trim()
    
    // Check for valid range patterns
    const patterns = [
      /^HEAD~\d+\.\.HEAD$/,           // HEAD~3..HEAD
      /^[a-fA-F0-9]{4,40}\.\.[a-fA-F0-9]{4,40}$/, // commit..commit
      /^[\w-/]+\.\.[\w-/]+$/,      // branch..branch
      /^HEAD~\d+\.\.[\w-/]+$/,       // HEAD~3..branch
      /^[\w-/]+\.\.HEAD$/,           // branch..HEAD
    ]

    const isValid = patterns.some(pattern => pattern.test(trimmedRange))
    
    if (!isValid) {
      return 'Invalid range format. Use patterns like HEAD~3..HEAD, commit1..commit2, or branch1..branch2'
    }

    return null
  }

  const handleApply = async () => {
    const validationError = validateRange(inputValue)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onRangeChange(inputValue.trim())
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update range')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleApply()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full px-3 py-1 text-sm font-mono rounded border ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : darkMode
                  ? 'bg-gray-600 border-gray-500 text-white focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
              } focus:outline-none focus:ring-1`}
              placeholder="e.g., HEAD~3..HEAD"
              autoFocus
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleApply}
            disabled={isLoading || !inputValue.trim()}
            className={`p-1.5 rounded ${
              isLoading || !inputValue.trim()
                ? darkMode
                  ? 'bg-gray-600 text-gray-400'
                  : 'bg-gray-200 text-gray-400'
                : 'bg-green-600 hover:bg-green-700 text-white'
            } transition-colors`}
            title="Apply range"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className={`p-1.5 rounded ${
              darkMode
                ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            } transition-colors`}
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {error && (
          <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
            {error}
          </div>
        )}
        
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Examples: HEAD~3..HEAD, main..feature, abc123..def456
          <br />
          Press Enter to apply, Escape to cancel
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <GitBranch className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
      <span className={`font-mono text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {currentRange}
      </span>
      {!disabled && (
        <button
          onClick={handleStartEdit}
          className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
            darkMode
              ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200'
              : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
          }`}
          title="Edit range"
        >
          <Edit3 className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}