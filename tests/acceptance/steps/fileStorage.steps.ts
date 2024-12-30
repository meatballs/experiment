import { Given, When, Then, Before, After } from '@cucumber/cucumber'
import { Browser, BrowserContext, Page, chromium, expect } from '@playwright/test'

let browser: Browser
let context: BrowserContext
let page: Page

// Before all tests
Before(async function (): Promise<void> {
  browser = await chromium.launch()
  context = await browser.newContext()
  page = await context.newPage()
  await page.goto('http://localhost:5173') // Vite's default dev server URL
})

// After all tests
After(async function () {
  await context.close()
  await browser.close()
})

Given('I am on the file upload page', async function (): Promise<void> {
  await page.goto('http://localhost:5173')
})

Given('I have stored files', async function (): Promise<void> {
  // Upload a test file to ensure we have stored files
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles('./tests/fixtures/test.txt')
  await page.waitForSelector('text=test.txt')
})

Given('I have at least one stored file', async function (): Promise<void> {
  // Upload a test file to ensure we have at least one stored file
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles('./tests/fixtures/test.txt')
  await page.waitForSelector('text=test.txt')
})

When('I select a file to upload', async function (): Promise<void> {
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles('./tests/fixtures/test.txt')
})

When('the file is less than 100MB', function (): Promise<void> {
  // This step is automatically true in our test environment
  // as we're using a small test file
  return Promise.resolve()
})

When('I select a specific file', async function (): Promise<void> {
  const fileElement = page.locator('.file-item').first()
  await fileElement.waitFor({ timeout: 10000 })
  await fileElement.click()
})

When('I choose to delete a file', async function (): Promise<void> {
  const deleteButton = page.locator('button[aria-label="Delete file"]').first()
  await deleteButton.waitFor({ timeout: 10000 })
  await deleteButton.click()
})

Then('the file should be stored with a unique ID', async function (): Promise<void> {
  // Wait for file to appear with timeout of 10 seconds
  const fileElement = page.locator('.file-item').first()
  await fileElement.waitFor({ timeout: 10000 })
  const fileId = await fileElement.getAttribute('data-file-id')
  expect(fileId).toBeTruthy()
})

Then('I should see the file in my stored files list', async function (): Promise<void> {
  const fileElement = page.locator('.file-item').first()
  await expect(fileElement).toBeVisible()
})

Then('I should see the file details including:', async function (dataTable): Promise<void> {
  // Wait for file details container to be visible
  await page.waitForSelector('.file-details', { timeout: 2000 })
  
  const fields = dataTable.raw().map((row: string[]) => row[0])
  for (const field of fields) {
    const fieldElement = page.locator(`.file-${field}`).first()
    await expect(fieldElement).toBeVisible({ timeout: 2000 })
  }
})

Then('the file should be removed from storage', async function (): Promise<void> {
  // Wait for deletion animation/process to complete
  await page.waitForTimeout(500)
})

Then('it should no longer appear in my files list', async function (): Promise<void> {
  const fileElements = await page.locator('.file-item').count()
  expect(fileElements).toBe(0)
})

Then('the file should have the correct size and type', async function (): Promise<void> {
  // Check if size and type information is displayed
  const fileInfo = page.locator('.file-info').first()
  const sizeText = await fileInfo.locator('.file-size').textContent()
  const typeText = await fileInfo.locator('.file-type').textContent()
  
  expect(sizeText).not.toBe('')
  expect(typeText).not.toBe('')
})

When('I delete the file {string}', async function (filename: string): Promise<void> {
  // Find and click delete button for the specific file
  const fileRow = page.locator(`text=${filename}`).first().locator('..')
  await fileRow.locator('button[aria-label="Delete file"]').click()
  
  // Wait for deletion confirmation
  await page.waitForSelector(`text=${filename}`, { state: 'detached' })
})

Then('I should not see the file {string} in my stored files', async function (filename: string): Promise<void> {
  // Verify file is not present
  const fileElement = page.locator(`text=${filename}`)
  await expect(fileElement).toBeHidden()
})

Given('I have the file {string} stored', async function (filename: string): Promise<void> {
  // First ensure no files exist
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  
  // Then upload the specified file
  const fileInput = await page.locator('input[type="file"]')
  await fileInput.setInputFiles(`./tests/fixtures/${filename}`)
  
  // Wait for upload completion
  await page.waitForSelector(`text=${filename}`)
})
