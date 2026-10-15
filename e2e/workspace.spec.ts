import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('creates a task and keeps it after reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Tasks', exact: true }).click()
  await page.getByRole('button', { name: 'New task' }).click()
  await page.getByLabel('Title').fill('E2E task survives reload')
  await page.getByRole('button', { name: 'Create task' }).click()

  await expect(page.getByText('E2E task survives reload', { exact: true })).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'Tasks', exact: true }).click()
  await expect(page.getByText('E2E task survives reload', { exact: true })).toBeVisible()
})

test('changes the selected reporting period', async ({ page }) => {
  await page.getByRole('button', { name: 'Reports', exact: true }).click()
  await expect(page.locator('.bar-column')).toHaveCount(11)

  await page.getByLabel('Report period').selectOption('Last 7 days')
  await expect(page.locator('.bar-column')).toHaveCount(7)
  await expect(page.locator('.bar-column').first()).toContainText('Oct 08')
})

test('updates Overview metrics, revenue chart, and export for each period', async ({ page }) => {
  const period = page.getByLabel('Reporting period')
  const totalRevenue = page.locator('.metrics-grid[aria-label="Workspace metrics"] .metric-card').first().locator('.metric-value')
  const chartTotal = page.locator('.revenue-total > strong')
  const bars = page.locator('.revenue-bar-column')

  await expect(totalRevenue).toHaveText('$48,290')
  await expect(bars).toHaveCount(7)

  await period.selectOption('Last 7 days')
  await expect(totalRevenue).toHaveText('$11,860')
  await expect(chartTotal).toHaveText('$11,860')
  await expect(bars.first()).toContainText('Oct 08')

  await period.selectOption('Last 90 days')
  await expect(totalRevenue).toHaveText('$132,640')
  await expect(chartTotal).toHaveText('$132,640')
  await expect(bars.first()).toContainText('Jul 17')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export', exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('northstar-revenue-report-last-90-days.csv')

  await page.getByRole('tab', { name: 'Analytics' }).click()
  await expect(page.getByText('Clicks and unique visitors · last 90 days')).toBeVisible()
  await expect(page.locator('.traffic-x-labels span')).toHaveCount(12)
  await expect(page.locator('.analytics-metrics .metric-card').first().locator('.metric-value')).toHaveText('81,420')
  await expect(page.locator('.analytics-metrics .metric-card').nth(2).locator('.metric-value')).toHaveText('30.4%')

  await page.getByRole('button', { name: 'Reports', exact: true }).click()
  await expect(page.getByLabel('Report period')).toHaveValue('Last 90 days')
  await page.getByRole('button', { name: 'Overview', exact: true }).click()
  await expect(page.getByLabel('Reporting period')).toHaveValue('Last 90 days')
})
