import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ReviewConfig } from '@shared'

interface SettingsStore extends ReviewConfig {
  updateSetting: <K extends keyof ReviewConfig>(key: K, value: ReviewConfig[K]) => void
  resetToDefaults: () => void
  saveSettings: () => Promise<void>
}

const defaultConfig: ReviewConfig = {
  contextLines: 3,
  showWhitespace: false,
  darkMode: true,
  viewMode: 'unified'
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultConfig,
      
      updateSetting: (key, value) => {
        set({ [key]: value })
      },
      
      resetToDefaults: () => {
        set(defaultConfig)
      },
      
      saveSettings: async () => {
        const settings = get()
        const config = {
          contextLines: settings.contextLines,
          showWhitespace: settings.showWhitespace,
          darkMode: settings.darkMode,
          viewMode: settings.viewMode
        }
        
        try {
          // Save to backend/local storage
          const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
          })
          
          if (!response.ok) {
            console.warn('Failed to save settings to server, using local storage only')
          }
        } catch (error) {
          console.warn('Failed to save settings to server:', error)
        }
      }
    }),
    {
      name: 'reviewflow-settings',
      partialize: (state) => ({
        contextLines: state.contextLines,
        showWhitespace: state.showWhitespace,
        darkMode: state.darkMode,
        viewMode: state.viewMode
      })
    }
  )
)