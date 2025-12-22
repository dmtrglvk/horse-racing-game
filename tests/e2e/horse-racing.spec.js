import { test, expect } from '@playwright/test'

test.describe('Horse Racing Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for horses to be generated (check for horse list table)
    await page.waitForSelector('.horse-list table tbody tr', { timeout: 5000 })
  })

  test('should display the application with all panels', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Horse Racing')
    
    await expect(page.getByRole('button', { name: 'GENERATE PROGRAM' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'START' })).toBeVisible()
    
    await expect(page.locator('.horse-list')).toBeVisible()
    await expect(page.locator('.race-track')).toBeVisible()
    await expect(page.locator('.program-results')).toBeVisible()
  })

  test('should display horse list with 20 horses', async ({ page }) => {
    await expect(page.locator('.horse-list-header h2')).toContainText('Horse List (1-20)')
    
    const horseRows = page.locator('.horse-list table tbody tr')
    await expect(horseRows).toHaveCount(20)
    
    await expect(page.locator('.horse-list table thead th').nth(0)).toContainText('Name')
    await expect(page.locator('.horse-list table thead th').nth(1)).toContainText('Condition')
    await expect(page.locator('.horse-list table thead th').nth(2)).toContainText('Color')
  })

  test('should generate race schedule when clicking GENERATE PROGRAM', async ({ page }) => {
    await page.getByRole('button', { name: 'GENERATE PROGRAM' }).click()
    
    // Wait for program rounds to appear
    await page.waitForSelector('.program-column .round-section', { timeout: 5000 })
    
    const programRounds = page.locator('.program-column .round-section')
    await expect(programRounds).toHaveCount(6)
    
    // Wait for round titles to be visible and check content
    await expect(page.locator('.program-column .round-title').first()).toBeVisible()
    await expect(page.locator('.program-column .round-title').first()).toContainText('1st Lap - 1200m')
    await expect(page.locator('.program-column .round-title').last()).toContainText('6th Lap - 2200m')
    
    const firstRoundHorses = page.locator('.program-column .round-section').first().locator('tbody tr')
    await expect(firstRoundHorses).toHaveCount(10)
  })

  test('should disable GENERATE PROGRAM button when race is in progress', async ({ page }) => {
    await page.getByRole('button', { name: 'GENERATE PROGRAM' }).click()
    
    // Wait for schedule to be generated
    await page.waitForSelector('.program-column .round-section', { timeout: 5000 })
    
    await page.getByRole('button', { name: 'START' }).click()
    
    // Wait for button to change to PAUSE (indicates race started)
    await expect(page.getByRole('button', { name: 'PAUSE' })).toBeVisible({ timeout: 5000 })
    
    await expect(page.getByRole('button', { name: 'GENERATE PROGRAM' })).toBeDisabled()
  })

  test('should start and pause race', async ({ page }) => {
    await page.getByRole('button', { name: 'GENERATE PROGRAM' }).click()
    
    // Wait for schedule to be generated
    await page.waitForSelector('.program-column .round-section', { timeout: 5000 })
    
    await page.getByRole('button', { name: 'START' }).click()
    
    // Wait for race to start (button changes to PAUSE)
    await expect(page.getByRole('button', { name: 'PAUSE' })).toBeVisible({ timeout: 5000 })
    
    await page.getByRole('button', { name: 'PAUSE' }).click()
    
    // Wait for button to change back to START
    await expect(page.getByRole('button', { name: 'START' })).toBeVisible({ timeout: 2000 })
  })

  test('should display horses on race track during race', async ({ page }) => {
    await page.getByRole('button', { name: 'GENERATE PROGRAM' }).click()
    
    // Wait for schedule to be generated
    await page.waitForSelector('.program-column .round-section', { timeout: 5000 })
    
    await page.getByRole('button', { name: 'START' }).click()
    
    // Wait for horses to appear on track (race has started)
    await page.waitForSelector('.race-track .horse', { timeout: 5000 })
    
    const horses = page.locator('.race-track .horse')
    await expect(horses.first()).toBeVisible()
    
    const horseCount = await horses.count()
    expect(horseCount).toBeGreaterThan(0)
    expect(horseCount).toBeLessThanOrEqual(10)
  })

  test('should show race track info with current round', async ({ page }) => {
    await page.getByRole('button', { name: 'GENERATE PROGRAM' }).click()
    
    // Wait for schedule to be generated
    await page.waitForSelector('.program-column .round-section', { timeout: 5000 })
    
    await page.getByRole('button', { name: 'START' }).click()
    
    // Wait for track info to appear
    await expect(page.locator('.track-info')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.track-info')).toContainText('Lap')
    await expect(page.locator('.track-info')).toContainText('m')
  })

  test('should display results after round completion', async ({ page }) => {
    await page.getByRole('button', { name: 'GENERATE PROGRAM' }).click()
    
    // Wait for schedule to be generated
    await page.waitForSelector('.program-column .round-section', { timeout: 5000 })
    
    await page.getByRole('button', { name: 'START' }).click()
    
    // Wait for race to start (horses appear on track)
    await page.waitForSelector('.race-track .horse', { timeout: 5000 })
    
    // Wait for "Race in progress..." to disappear and results table to appear
    // This indicates the round has completed
    await page.waitForFunction(
      () => {
        const firstRoundSection = document.querySelector('.results-column .round-section:first-child')
        if (!firstRoundSection) return false
        const noResults = firstRoundSection.querySelector('.no-results')
        const table = firstRoundSection.querySelector('table')
        return !noResults && table !== null
      },
      { timeout: 60000 } // Increased timeout to 60 seconds for race completion
    )
    
    const resultsTable = page.locator('.results-column .round-section').first().locator('table')
    await expect(resultsTable).toBeVisible()
    
    await expect(resultsTable.locator('thead th').first()).toContainText('Position')
    await expect(resultsTable.locator('thead th').nth(1)).toContainText('Name')
    
    const resultRows = resultsTable.locator('tbody tr')
    await expect(resultRows.first()).toBeVisible()
  })

  test('should show "Race in progress..." when round is not completed', async ({ page }) => {
    await page.getByRole('button', { name: 'GENERATE PROGRAM' }).click()
    
    // Wait for schedule to be generated
    await page.waitForSelector('.program-column .round-section', { timeout: 5000 })
    
    const noResults = page.locator('.results-column .no-results')
    await expect(noResults.first()).toContainText('Race in progress...')
  })

  test('should have colored horse icons on track', async ({ page }) => {
    await page.getByRole('button', { name: 'GENERATE PROGRAM' }).click()
    
    // Wait for schedule to be generated
    await page.waitForSelector('.program-column .round-section', { timeout: 5000 })
    
    await page.getByRole('button', { name: 'START' }).click()
    
    // Wait for horses to appear on track
    await page.waitForSelector('.race-track .horse-icon', { timeout: 5000 })
    
    const firstHorse = page.locator('.race-track .horse-icon').first()
    await expect(firstHorse).toBeVisible()
    
    const backgroundColor = await firstHorse.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(backgroundColor).not.toBe('transparent')
  })

  test('should disable START button when no schedule exists', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'START' })).toBeDisabled()
  })

  test('should enable START button after generating schedule', async ({ page }) => {
    await page.getByRole('button', { name: 'GENERATE PROGRAM' }).click()
    
    // Wait for schedule to be generated
    await page.waitForSelector('.program-column .round-section', { timeout: 5000 })
    
    await expect(page.getByRole('button', { name: 'START' })).toBeEnabled()
  })
})
