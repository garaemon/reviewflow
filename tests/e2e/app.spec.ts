import { test, expect } from '@playwright/test'

test.describe('ReviewFlow Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the main application layout', async ({ page }) => {
    // Check if the main title is displayed
    await expect(page.getByText('ReviewFlow')).toBeVisible()

    // Check navigation tabs
    await expect(page.getByRole('button', { name: /files/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /settings/i })).toBeVisible()

    // Verify the logo/icon is present
    await expect(page.locator('[aria-label="ReviewFlow - Code Review Tool"]')).toBeVisible()
  })

  test('should navigate between tabs', async ({ page }) => {
    // Start on files tab (default)
    const filesTab = page.getByRole('button', { name: /files/i })
    const settingsTab = page.getByRole('button', { name: /settings/i })

    // Verify files tab is initially active
    await expect(filesTab).toHaveClass(/bg-blue-600/)

    // Click settings tab
    await settingsTab.click()

    // Verify settings tab becomes active
    await expect(settingsTab).toHaveClass(/bg-blue-600/)

    // Verify settings content is displayed
    await expect(page.getByText('Review Settings')).toBeVisible()

    // Click back to files tab
    await filesTab.click()

    // Verify files tab becomes active again
    await expect(filesTab).toHaveClass(/bg-blue-600/)
  })

  test('should display accessibility features', async ({ page }) => {
    // Check for proper ARIA labels and titles
    await expect(page.getByTitle('View files and review code changes')).toBeVisible()
    await expect(page.getByTitle('Configure application settings and preferences')).toBeVisible()

    // Verify screen reader accessibility
    const logo = page.locator('[aria-label="ReviewFlow - Code Review Tool"]')
    await expect(logo).toBeVisible()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    const filesTab = page.getByRole('button', { name: /files/i })
    const settingsTab = page.getByRole('button', { name: /settings/i })

    // Focus on files tab and use keyboard
    await filesTab.focus()
    await page.keyboard.press('Tab')

    // Should move focus to settings tab
    await expect(settingsTab).toBeFocused()

    // Press Enter to activate
    await page.keyboard.press('Enter')

    // Verify settings content is displayed
    await expect(page.getByText('Review Settings')).toBeVisible()
  })

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Application should still be functional
    await expect(page.getByText('ReviewFlow')).toBeVisible()
    await expect(page.getByRole('button', { name: /files/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /settings/i })).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    // Application should still be functional
    await expect(page.getByText('ReviewFlow')).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Application should still be functional
    await expect(page.getByText('ReviewFlow')).toBeVisible()
  })
})