export type ReportingPeriod = 'Last 7 days' | 'Last 30 days' | 'Last 90 days'

type DashboardPeriodData = {
  traffic: {
    labels: string[]
    clicks: number[]
    visitors: number[]
  }
  revenue: {
    labels: string[]
    amounts: number[]
  }
  metrics: {
    revenue: number
    revenueChange: string
    activeMembers: number
    tasksCompleted: number
    tasksChange: string
    workspaceVisits: number
    visitsChange: string
    clicks: number
    clicksChange: string
    bounceRate: string
    bounceChange: string
    averageSession: string
    sessionChange: string
  }
}

export const dashboardData: Record<ReportingPeriod, DashboardPeriodData> = {
  'Last 7 days': {
    traffic: {
      labels: ['Oct 08', 'Oct 09', 'Oct 10', 'Oct 11', 'Oct 12', 'Oct 13', 'Oct 14'],
      clicks: [46, 58, 52, 72, 66, 84, 78],
      visitors: [34, 42, 39, 55, 49, 63, 59],
    },
    revenue: {
      labels: ['Oct 08', 'Oct 09', 'Oct 10', 'Oct 11', 'Oct 12', 'Oct 13', 'Oct 14'],
      amounts: [1240, 1380, 1520, 1640, 1780, 1940, 2360],
    },
    metrics: {
      revenue: 11860,
      revenueChange: '+6.2% vs previous 7 days',
      activeMembers: 24,
      tasksCompleted: 42,
      tasksChange: '+8.1% vs previous 7 days',
      workspaceVisits: 3260,
      visitsChange: '+4.3% vs previous 7 days',
      clicks: 6820,
      clicksChange: '+9.5% vs previous 7 days',
      bounceRate: '36.2%',
      bounceChange: '-2.1 pts vs previous 7 days',
      averageSession: '3m 48s',
      sessionChange: '+7.4% vs previous 7 days',
    },
  },
  'Last 30 days': {
    traffic: {
      labels: ['Sep 15', 'Sep 18', 'Sep 21', 'Sep 24', 'Sep 27', 'Sep 30', 'Oct 03', 'Oct 06', 'Oct 09', 'Oct 12', 'Oct 13', 'Oct 14'],
      clicks: [35, 42, 39, 57, 51, 68, 63, 75, 68, 88, 80, 96],
      visitors: [26, 31, 29, 43, 39, 51, 47, 58, 52, 67, 61, 73],
    },
    revenue: {
      labels: ['Sep 15', 'Sep 20', 'Sep 25', 'Sep 30', 'Oct 05', 'Oct 10', 'Oct 14'],
      amounts: [5900, 6420, 6810, 7140, 7520, 8240, 6260],
    },
    metrics: {
      revenue: 48290,
      revenueChange: '+12.8% vs previous 30 days',
      activeMembers: 24,
      tasksCompleted: 186,
      tasksChange: '+18.2% vs previous 30 days',
      workspaceVisits: 12480,
      visitsChange: '+8.4% vs previous 30 days',
      clicks: 28492,
      clicksChange: '+16.4% vs previous 30 days',
      bounceRate: '32.8%',
      bounceChange: '-4.2 pts vs previous 30 days',
      averageSession: '4m 32s',
      sessionChange: '+12.1% vs previous 30 days',
    },
  },
  'Last 90 days': {
    traffic: {
      labels: ['Jul 17', 'Jul 25', 'Aug 02', 'Aug 10', 'Aug 18', 'Aug 26', 'Sep 03', 'Sep 11', 'Sep 19', 'Sep 27', 'Oct 05', 'Oct 14'],
      clicks: [29, 37, 35, 49, 46, 61, 58, 73, 70, 86, 82, 96],
      visitors: [22, 28, 26, 37, 34, 45, 42, 54, 50, 65, 60, 72],
    },
    revenue: {
      labels: ['Jul 17', 'Aug 02', 'Aug 18', 'Sep 03', 'Sep 19', 'Oct 05', 'Oct 14'],
      amounts: [16200, 17400, 18300, 19100, 19700, 20700, 21240],
    },
    metrics: {
      revenue: 132640,
      revenueChange: '+18.6% vs previous 90 days',
      activeMembers: 24,
      tasksCompleted: 524,
      tasksChange: '+22.4% vs previous 90 days',
      workspaceVisits: 36850,
      visitsChange: '+15.2% vs previous 90 days',
      clicks: 81420,
      clicksChange: '+21.7% vs previous 90 days',
      bounceRate: '30.4%',
      bounceChange: '-5.6 pts vs previous 90 days',
      averageSession: '5m 06s',
      sessionChange: '+16.8% vs previous 90 days',
    },
  },
}

export function formatRevenue(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function createRevenueCsv(period: ReportingPeriod) {
  const data = dashboardData[period]
  const rows = [
    ['Reporting period', period],
    ['Date', 'Revenue (USD)'],
    ...data.revenue.labels.map((label, index) => [label, String(data.revenue.amounts[index])]),
    ['Total', String(data.metrics.revenue)],
  ]

  return rows.map((row) => row.join(',')).join('\n')
}
