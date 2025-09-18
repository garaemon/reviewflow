import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Settings } from '../components/Settings'

// Mock the settings store
vi.mock('../store/settingsStore', () => ({
  useSettingsStore: () => ({
    contextLines: 3,
    showWhitespace: false,
    darkMode: false,
    viewMode: 'unified',
    updateSetting: vi.fn(),
    resetToDefaults: vi.fn(),
    saveSettings: vi.fn().mockResolvedValue(undefined),
  })
}))

describe('Settings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all settings options', () => {
    render(<Settings />)

    expect(screen.getByText('Review Settings')).toBeInTheDocument()
    expect(screen.getByText('Context Lines')).toBeInTheDocument()
    expect(screen.getByText('View Mode')).toBeInTheDocument()
    expect(screen.getByText('Dark Mode')).toBeInTheDocument()
    expect(screen.getByText('Show Whitespace')).toBeInTheDocument()
  })

  it('displays the correct range slider value', () => {
    render(<Settings />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveValue('3')
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows unified view mode as selected by default', () => {
    render(<Settings />)

    const unifiedRadio = screen.getByRole('radio', { name: /unified/i })
    const splitRadio = screen.getByRole('radio', { name: /side by side/i })

    expect(unifiedRadio).toBeChecked()
    expect(splitRadio).not.toBeChecked()
  })

  it('displays toggle switches for boolean settings', () => {
    render(<Settings />)

    const checkboxes = screen.getAllByRole('checkbox')

    expect(checkboxes).toHaveLength(2)
    expect(checkboxes[0]).not.toBeChecked() // Dark mode
    expect(checkboxes[1]).not.toBeChecked() // Show whitespace
  })

  it('shows keyboard shortcuts section', () => {
    render(<Settings />)

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
    expect(screen.getByText('j/k')).toBeInTheDocument()
    expect(screen.getByText('- Next/Previous hunk')).toBeInTheDocument()
  })

  it('renders save and reset buttons', () => {
    render(<Settings />)

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('shows success message after saving', async () => {
    render(<Settings />)

    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument()
    })
  })
})