import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'

export function Settings() {
  const {
    contextLines,
    showWhitespace,
    darkMode,
    viewMode,
    updateSetting,
    resetToDefaults,
    saveSettings
  } = useSettingsStore()
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      await saveSettings()
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    resetToDefaults()
    setSaveStatus('idle')
  }

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-2xl border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-base font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Review Settings</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            className={`flex items-center px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-md transition-colors`}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 ${darkMode ? 'disabled:bg-blue-800' : 'disabled:bg-blue-400'} text-white rounded-md transition-colors`}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {saveStatus === 'success' && (
        <div className={`mb-4 p-3 ${darkMode ? 'bg-green-900/50 border-green-700 text-green-300' : 'bg-green-100 border-green-300 text-green-700'} border rounded-md`}>
          <p className="text-sm">Settings saved successfully!</p>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className={`mb-4 p-3 ${darkMode ? 'bg-red-900/50 border-red-700 text-red-300' : 'bg-red-100 border-red-300 text-red-700'} border rounded-md`}>
          <p className="text-sm">Failed to save settings. Using local storage.</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Context Lines */}
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Context Lines
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="10"
              value={contextLines}
              onChange={(e) => updateSetting('contextLines', parseInt(e.target.value))}
              className={`flex-1 h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-lg appearance-none cursor-pointer slider`}
            />
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm w-8`}>{contextLines}</span>
          </div>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-1`}>
            Number of context lines to show around changes
          </p>
        </div>

        {/* View Mode */}
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            View Mode
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="viewMode"
                value="unified"
                checked={viewMode === 'unified'}
                onChange={(e) => updateSetting('viewMode', e.target.value as 'unified' | 'split')}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 ${darkMode ? 'border-gray-300 bg-gray-700' : 'border-gray-400 bg-white'}`}
              />
              <span className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Unified</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="viewMode"
                value="split"
                checked={viewMode === 'split'}
                onChange={(e) => updateSetting('viewMode', e.target.value as 'unified' | 'split')}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 ${darkMode ? 'border-gray-300 bg-gray-700' : 'border-gray-400 bg-white'}`}
              />
              <span className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Side by Side</span>
            </label>
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex flex-col">
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dark Mode</span>
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Use dark theme</span>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => updateSetting('darkMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex flex-col">
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Show Whitespace</span>
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Display whitespace characters</span>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showWhitespace}
                onChange={(e) => updateSetting('showWhitespace', e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
            </label>
          </div>
        </div>

        <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Keyboard Shortcuts</h3>
          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} space-y-1`}>
            <div><kbd className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} px-1 rounded`}>j/k</kbd> - Next/Previous hunk</div>
            <div><kbd className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} px-1 rounded`}>r</kbd> - Mark as reviewed</div>
            <div><kbd className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} px-1 rounded`}>n</kbd> - Add note</div>
            <div><kbd className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} px-1 rounded`}>c</kbd> - Add comment</div>
          </div>
        </div>
      </div>
    </div>
  )
}