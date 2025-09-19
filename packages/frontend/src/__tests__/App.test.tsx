import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App Component', () => {
  it('renders the main navigation', () => {
    render(<App />)

    expect(screen.getByText('ReviewFlow')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /files/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
  })

  it('switches between tabs when clicked', () => {
    render(<App />)

    const filesTab = screen.getByRole('button', { name: /files/i })
    const settingsTab = screen.getByRole('button', { name: /settings/i })

    // Initially files tab should be active
    expect(filesTab).toHaveClass('bg-blue-600')

    // Click settings tab
    fireEvent.click(settingsTab)
    expect(settingsTab).toHaveClass('bg-blue-600')

    // Click files tab again
    fireEvent.click(filesTab)
    expect(filesTab).toHaveClass('bg-blue-600')
  })

  it('displays the correct aria labels for accessibility', () => {
    render(<App />)

    const logo = screen.getByLabelText('ReviewFlow - Code Review Tool')
    expect(logo).toBeInTheDocument()

    const filesButton = screen.getByTitle('View files and review code changes')
    const settingsButton = screen.getByTitle('Configure application settings and preferences')

    expect(filesButton).toBeInTheDocument()
    expect(settingsButton).toBeInTheDocument()
  })
})