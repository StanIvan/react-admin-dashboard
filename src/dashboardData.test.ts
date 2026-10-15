import { describe, expect, it } from 'vitest'
import {
  createRevenueCsv,
  dashboardData,
  formatRevenue,
  type ReportingPeriod,
} from './dashboardData'

describe('dashboard reporting data', () => {
  it.each(['Last 7 days', 'Last 30 days', 'Last 90 days'] as ReportingPeriod[])(
    'keeps revenue totals and chart samples consistent for %s',
    (period) => {
      const data = dashboardData[period]
      const revenueTotal = data.revenue.amounts.reduce((sum, amount) => sum + amount, 0)

      expect(revenueTotal).toBe(data.metrics.revenue)
      expect(data.revenue.labels).toHaveLength(data.revenue.amounts.length)
      expect(data.traffic.labels).toHaveLength(data.traffic.clicks.length)
      expect(data.traffic.labels).toHaveLength(data.traffic.visitors.length)
    },
  )

  it('formats totals and exports the selected period with its matching total', () => {
    const csv = createRevenueCsv('Last 7 days')

    expect(formatRevenue(dashboardData['Last 7 days'].metrics.revenue)).toBe('$11,860')
    expect(csv).toContain('Reporting period,Last 7 days')
    expect(csv).toContain('Total,11860')
    expect(csv).not.toContain('Total,48290')
  })
})
