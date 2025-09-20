import { useState } from 'react'
import { FileText, GitBranch, Settings as SettingsIcon } from 'lucide-react'
import { Settings } from './components/Settings'
import { ReviewSession } from './components/ReviewSession'
import { useSettingsStore } from './store/settingsStore'

function App() {
  const [activeTab, setActiveTab] = useState<'files' | 'settings'>('files')
  const { darkMode } = useSettingsStore()

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <GitBranch className="h-8 w-8 text-blue-500 mr-3" aria-label="ReviewFlow - Code Review Tool" />
              <h1 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>ReviewFlow</h1>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('files')}
                className={`px-3 py-2 rounded-md text-2xs font-medium flex items-center ${
                  activeTab === 'files'
                    ? 'bg-blue-600 text-white'
                    : darkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title="View files and review code changes"
              >
                <FileText className="w-4 h-4 mr-2" />
                Files
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-2 rounded-md text-2xs font-medium flex items-center ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white'
                    : darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title="Configure application settings and preferences"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'files' && <ReviewSession />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  )
}

export default App