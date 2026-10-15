import { useState } from 'react'
import {
  ArrowDownRight,
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Eye,
  MousePointerClick,
  Plus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import {
  createRevenueCsv,
  dashboardData,
  formatRevenue,
  type ReportingPeriod,
} from './dashboardData'

type ProjectSummary = {
  name: string
  category: string
  initials: string
  color: string
  progress: number
  due: string
  status: string
}

type DashboardPageProps = {
  projects: ProjectSummary[]
  period: ReportingPeriod
  onPeriodChange: (period: ReportingPeriod) => void
  onCreateProject: () => void
  onProjects: () => void
  onReports: () => void
  onNotify: (message: string) => void
}

const sales = [
  { name: 'Olivia Rhye', email: 'olivia@example.com', amount: '$1,240.00', initials: 'OR', color: 'lavender' },
  { name: 'Phoenix Baker', email: 'phoenix@example.com', amount: '$890.00', initials: 'PB', color: 'peach' },
  { name: 'Lana Steiner', email: 'lana@example.com', amount: '$675.00', initials: 'LS', color: 'mint' },
  { name: 'Demi Wilkinson', email: 'demi@example.com', amount: '$420.00', initials: 'DW', color: 'blue' },
]

const referrers = [
  { label: 'Direct', value: 38 },
  { label: 'Search', value: 27 },
  { label: 'Social', value: 21 },
  { label: 'Referral', value: 14 },
]

function chartPoints(values: readonly number[]) {
  return values.map((value, index) => `${(index / (values.length - 1)) * 700},${190 - value * 1.7}`).join(' ')
}

function downloadCsv(period: ReportingPeriod) {
  const csv = createRevenueCsv(period)
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `northstar-revenue-report-${period.toLowerCase().replaceAll(' ', '-')}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function DashboardPage({ projects, period, onPeriodChange, onCreateProject, onProjects, onReports, onNotify }: DashboardPageProps) {
  const [tab, setTab] = useState<'Overview' | 'Analytics'>('Overview')
  const current = dashboardData[period]
  const maximumRevenue = Math.max(...current.revenue.amounts)

  function exportReport() {
    downloadCsv(period)
    onNotify(`Revenue report for ${period.toLowerCase()} downloaded as CSV.`)
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> NORTHSTAR STUDIO</div>
          <h1>{tab === 'Overview' ? 'Good morning, Alex' : 'Analytics'}</h1>
          <p className="page-subtitle">{tab === 'Overview' ? 'Here’s what’s happening across your workspace today.' : 'A closer look at your workspace performance and traffic.'}</p>
        </div>
        <div className="heading-actions">
          <label className="select-control"><CalendarDays size={16} /><select aria-label="Reporting period" value={period} onChange={(event) => onPeriodChange(event.target.value as ReportingPeriod)}><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option></select></label>
          {tab === 'Overview' ? <button className="primary-button" onClick={onCreateProject}><Plus size={17} /> New project</button> : <button className="primary-button" onClick={exportReport}><ArrowDownToLine size={16} /> Export CSV</button>}
        </div>
      </section>

      <div className="dashboard-tabs" role="tablist" aria-label="Dashboard views">
        {(['Overview', 'Analytics'] as const).map((item) => (
          <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>

      {tab === 'Overview' ? (
        <>
          <section className="metrics-grid" aria-label="Workspace metrics">
            <Metric icon={CreditCard} label="Total revenue" value={formatRevenue(current.metrics.revenue)} change={current.metrics.revenueChange} />
            <Metric icon={Users} label="Active members" value={String(current.metrics.activeMembers)} change="Currently active" />
            <Metric icon={CheckCircle2} label="Tasks completed" value={current.metrics.tasksCompleted.toLocaleString()} change={current.metrics.tasksChange} />
            <Metric icon={Eye} label="Workspace visits" value={current.metrics.workspaceVisits.toLocaleString()} change={current.metrics.visitsChange} />
          </section>

          <section className="dashboard-content-grid">
            <article className="panel dashboard-chart-panel">
              <div className="panel-heading"><div><h2>Revenue overview</h2><p>Revenue breakdown · {period.toLowerCase()}</p></div><button className="subtle-button" onClick={exportReport}><ArrowDownToLine size={14} /> Export</button></div>
              <div className="revenue-total"><strong>{formatRevenue(current.metrics.revenue)}</strong><span className="change-pill"><ArrowUpRight size={13} />{current.metrics.revenueChange.split(' ')[0]}</span><span className="summary-caption">compared to previous period</span></div>
              <div className="revenue-bars" role="img" aria-label={`Revenue breakdown for ${period}`}>
                {current.revenue.labels.map((label, index) => {
                  const amount = current.revenue.amounts[index]
                  const height = Math.max(12, Math.round((amount / maximumRevenue) * 100))
                  const isLatest = index === current.revenue.amounts.length - 1
                  return <div className={`revenue-bar-column${isLatest ? ' is-current' : ''}`} key={label} title={`${label}: ${formatRevenue(amount)}`}><span className="revenue-bar-value">{formatRevenue(amount)}</span><div className="revenue-bar-track"><span style={{ height: `${height}%` }} /></div><span className="revenue-month">{label}</span></div>
                })}
              </div>
            </article>
            <article className="panel recent-sales-panel">
              <div className="panel-heading"><div><h2>Recent sales</h2><p>Latest workspace transactions</p></div><button className="subtle-button" onClick={onReports}>View report <ArrowUpRight size={14} /></button></div>
              <div className="sales-list">{sales.map((sale) => <div className="sales-row" key={sale.email}><div className={`avatar avatar-${sale.color}`}>{sale.initials}</div><div className="sales-person"><strong>{sale.name}</strong><span>{sale.email}</span></div><strong className="sales-amount">{sale.amount}</strong></div>)}</div>
            </article>
          </section>

          <section className="panel projects-panel">
            <div className="panel-heading projects-heading"><div><h2>Projects</h2><p>A quick look at your team’s current work</p></div><div className="panel-actions"><button className="subtle-button" onClick={onProjects}>All projects <ArrowUpRight size={15} /></button><button className="icon-button" aria-label="Add a project" onClick={onCreateProject}><Plus size={18} /></button></div></div>
            <div className="table-scroll"><table className="project-table"><thead><tr><th>PROJECT</th><th>STATUS</th><th>PROGRESS</th><th>DUE DATE</th></tr></thead><tbody>{projects.slice(0, 4).map((project) => <tr key={`${project.name}-${project.due}`}><td><div className="project-name-cell"><div className={`project-avatar ${project.color}`}>{project.initials || 'P'}</div><div><strong>{project.name}</strong><span>{project.category}</span></div></div></td><td><span className={`status status-${project.status.toLowerCase().replace(' ', '-')}`}><i />{project.status}</span></td><td><div className="progress-cell"><div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div><span>{project.progress}%</span></div></td><td className="due-date">{project.due}</td></tr>)}</tbody></table></div>
          </section>
        </>
      ) : (
        <>
          <section className="metrics-grid analytics-metrics">
            <Metric icon={MousePointerClick} label="Total clicks" value={current.metrics.clicks.toLocaleString()} change={current.metrics.clicksChange} />
            <Metric icon={Eye} label="Unique visitors" value={current.metrics.workspaceVisits.toLocaleString()} change={current.metrics.visitsChange} />
            <Metric icon={BarChart3} label="Bounce rate" value={current.metrics.bounceRate} change={current.metrics.bounceChange} trend="down" />
            <Metric icon={CalendarDays} label="Avg. session" value={current.metrics.averageSession} change={current.metrics.sessionChange} />
          </section>
          <section className="panel traffic-panel">
            <div className="panel-heading"><div><h2>Traffic activity</h2><p>Clicks and unique visitors · {period.toLowerCase()}</p></div><div className="chart-legend"><span><i className="legend-clicks" />Clicks</span><span><i className="legend-visitors" />Visitors</span></div></div>
            <div className="traffic-chart" role="img" aria-label={`Traffic clicks and visitors for ${period}`}>
              <div className="traffic-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
              <svg viewBox="0 0 700 200" preserveAspectRatio="none" aria-hidden="true">
                {[20, 62, 104, 146, 188].map((y) => <line key={y} x1="0" x2="700" y1={y} y2={y} className="chart-gridline" />)}
                <polyline points={chartPoints(current.traffic.visitors)} className="traffic-line visitors-line" />
                <polyline points={chartPoints(current.traffic.clicks)} className="traffic-line clicks-line" />
              </svg>
            </div>
            <div className="traffic-x-labels">{current.traffic.labels.map((label) => <span key={label}>{label}</span>)}</div>
          </section>
          <section className="analytics-details-grid">
            <article className="panel referrer-panel"><div className="panel-heading"><div><h2>Traffic sources</h2><p>Where your visitors come from</p></div></div>{referrers.map((source) => <div className="source-row" key={source.label}><span>{source.label}</span><div className="source-track"><i style={{ width: `${source.value}%` }} /></div><strong>{source.value}%</strong></div>)}</article>
            <article className="panel device-panel"><div className="panel-heading"><div><h2>Devices</h2><p>Visitor device breakdown</p></div></div><div className="device-total"><strong>12,480</strong><span>total visitors</span></div><div className="device-row"><span><i className="device-dot desktop" />Desktop</span><strong>58%</strong></div><div className="device-row"><span><i className="device-dot mobile" />Mobile</span><strong>34%</strong></div><div className="device-row"><span><i className="device-dot tablet" />Tablet</span><strong>8%</strong></div></article>
          </section>
        </>
      )}
    </>
  )
}

function Metric({ icon: Icon, label, value, change, trend = 'up' }: { icon: LucideIcon; label: string; value: string; change: string; trend?: 'up' | 'down' }) {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight
  return <article className="metric-card"><div className="metric-top"><span className="metric-icon"><Icon size={17} strokeWidth={1.8} /></span></div><div className="metric-value">{value}</div><div className="metric-label">{label}</div><div className="metric-change positive"><TrendIcon size={14} />{change}</div></article>
}
