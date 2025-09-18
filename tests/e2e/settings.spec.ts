import { test, expect } from '@playwright/test'

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Navigate to settings tab
    await page.getByRole('button', { name: /settings/i }).click()
    await expect(page.getByText('Review Settings')).toBeVisible()
  })

  test('should display all settings options', async ({ page }) => {
    // Check main settings sections
    await expect(page.getByText('Context Lines')).toBeVisible()
    await expect(page.getByText('View Mode')).toBeVisible()
    await expect(page.getByText('Dark Mode')).toBeVisible()
    await expect(page.getByText('Show Whitespace')).toBeVisible()

    // Check keyboard shortcuts section
    await expect(page.getByText('Keyboard Shortcuts')).toBeVisible()
    await expect(page.getByText('j/k')).toBeVisible()
    await expect(page.getByText('Next/Previous hunk')).toBeVisible()
  })

  test('should allow context lines adjustment', async ({ page }) => {
    const slider = page.getByRole('slider')
    const valueDisplay = page.locator('text=3').last() // The value next to slider

    // Verify default value
    await expect(valueDisplay).toBeVisible()

    // Change slider value
    await slider.fill('5')

    // Verify the display updates
    await expect(page.locator('text=5').last()).toBeVisible()
  })

  test('should allow view mode selection', async ({ page }) => {
    const unifiedRadio = page.getByRole('radio', { name: /unified/i })
    const splitRadio = page.getByRole('radio', { name: /side by side/i })

    // Verify unified is selected by default
    await expect(unifiedRadio).toBeChecked()
    await expect(splitRadio).not.toBeChecked()

    // Select split view
    await splitRadio.click()

    // Verify split is now selected
    await expect(splitRadio).toBeChecked()
    await expect(unifiedRadio).not.toBeChecked()
  })

  test('should toggle dark mode', async ({ page }) => {
    const darkModeToggle = page.locator('label').filter({ hasText: 'Dark Mode' }).locator('input')

    // Initially should be light mode (not checked)
    await expect(darkModeToggle).not.toBeChecked()

    // Toggle dark mode
    await darkModeToggle.click()

    // Verify dark mode is enabled
    await expect(darkModeToggle).toBeChecked()

    // Check if the UI changes to dark theme
    await expect(page.locator('body')).toHaveClass(/bg-gray-900/)
  })

  test('should toggle whitespace display', async ({ page }) => {
    const whitespaceToggle = page.locator('label').filter({ hasText: 'Show Whitespace' }).locator('input')

    // Initially should be disabled (not checked)
    await expect(whitespaceToggle).not.toBeChecked()

    // Toggle whitespace display
    await whitespaceToggle.click()

    // Verify whitespace display is enabled
    await expect(whitespaceToggle).toBeChecked()
  })

  test('should save settings', async ({ page }) => {
    const saveButton = page.getByRole('button', { name: /save/i })

    // Click save button
    await saveButton.click()

    // Should show loading state
    await expect(page.getByText('Saving...')).toBeVisible()

    // Should show success message
    await expect(page.getByText('Settings saved successfully!')).toBeVisible({ timeout: 5000 })

    // Success message should disappear after timeout
    await expect(page.getByText('Settings saved successfully!')).not.toBeVisible({ timeout: 3000 })
  })

  test('should reset settings to defaults', async ({ page }) => {
    const slider = page.getByRole('slider')
    const resetButton = page.getByRole('button', { name: /reset/i })
    const darkModeToggle = page.locator('label').filter({ hasText: 'Dark Mode' }).locator('input')

    // Make some changes first
    await slider.fill('7')
    await darkModeToggle.click()

    // Verify changes were made
    await expect(page.locator('text=7').last()).toBeVisible()
    await expect(darkModeToggle).toBeChecked()

    // Reset to defaults
    await resetButton.click()

    // Verify settings are reset
    await expect(page.locator('text=3').last()).toBeVisible() // Default context lines
    await expect(darkModeToggle).not.toBeChecked() // Default dark mode off
  })

  test('should maintain settings state when switching tabs', async ({ page }) => {
    const darkModeToggle = page.locator('label').filter({ hasText: 'Dark Mode' }).locator('input')
    const filesTab = page.getByRole('button', { name: /files/i })
    const settingsTab = page.getByRole('button', { name: /settings/i })

    // Enable dark mode
    await darkModeToggle.click()
    await expect(darkModeToggle).toBeChecked()

    // Switch to files tab
    await filesTab.click()

    // Verify dark mode is still applied
    await expect(page.locator('body')).toHaveClass(/bg-gray-900/)

    // Switch back to settings
    await settingsTab.click()

    // Verify dark mode toggle is still checked
    await expect(darkModeToggle).toBeChecked()
  })
})