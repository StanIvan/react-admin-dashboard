import { useState } from 'react'
import {
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
  onCreateProject: () => void
  onProjects: () => void
  onNotify: (message: string) => void
}

const series = {
  'Last 7 days': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    clicks: [46, 58, 52, 72, 66, 84, 78],
    visitors: [34, 42, 39, 55, 49, 63, 59],
  },
  'Last 30 days': {
    labels: ['Sep 15', 'Sep 20', 'Sep 25', 'Sep 30', 'Oct 05', 'Oct 10', 'Oct 14'],
    clicks: [35, 42, 39, 57, 51, 68, 63, 75, 68, 88, 80, 96],
    visitors: [26, 31, 29, 43, 39, 51, 47, 58, 52, 67, 61, 73],
  },
  'Last 90 days': {
    labels: ['Aug 17', 'Aug 29', 'Sep 10', 'Sep 22', 'Oct 04', 'Oct 14'],
    clicks: [29, 37, 35, 49, 46, 61, 58, 73, 70, 86, 82, 96],
    visitors: [22, 28, 26, 37, 34, 45, 42, 54, 50, 65, 60, 72],
  },
} as const

const revenue = [
  { month: 'May', amount: 42 },
  { month: 'Jun', amount: 58 },
  { month: 'Jul', amount: 49 },
  { month: 'Aug', amount: 72 },
  { month: 'Sep', amount: 63 },
  { month: 'Oct', amount: 86 },
]

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

function downloadCsv() {
  const rows = [
    ['Month', 'Revenue'],
    ...revenue.map(({ month, amount }) => [month, String(amount * 1000)]),
  ]
  const csv = rows.map((row) => row.join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'northstar-revenue-report.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function DashboardPage({ projects, onCreateProject, onProjects, onNotify }: DashboardPageProps) {
  const [tab, setTab] = useState<'Overview' | 'Analytics'>('Overview')
  const [period, setPeriod] = useState<keyof typeof series>('Last 30 days')
  const current = series[period]

  function exportReport() {
    downloadCsv()
    onNotify('Revenue report downloaded as CSV.')
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
          <label className="select-control"><CalendarDays size={16} /><select aria-label="Reporting period" value={period} onChange={(event) => setPeriod(event.target.value as keyof typeof series)}><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option></select></label>
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
            <Metric icon={CreditCard} label="Total revenue" value="$48,290" change="+12.8% vs last period" />
            <Metric icon={Users} label="Active members" value="24" change="+4 this month" />
            <Metric icon={CheckCircle2} label="Tasks completed" value="186" change="+18.2% vs last period" />
            <Metric icon={Eye} label="Workspace visits" value="12,480" change="+8.4% vs last period" />
          </section>

          <section className="dashboard-content-grid">
            <article className="panel dashboard-chart-panel">
              <div className="panel-heading"><div><h2>Revenue overview</h2><p>Revenue performance over the last six months</p></div><button className="subtle-button" onClick={exportReport}><ArrowDownToLine size={14} /> Export</button></div>
              <div className="revenue-total"><strong>$48,290</strong><span className="change-pill"><ArrowUpRight size={13} /> 12.8%</span><span className="summary-caption">compared to previous period</span></div>
              <div className="revenue-bars" role="img" aria-label="Monthly revenue from May to October">
                {revenue.map((item) => <div className="revenue-bar-column" key={item.month}><span className="revenue-bar-value">${item.amount}k</span><div className="revenue-bar-track"><span style={{ height: `${item.amount}%` }} /></div><span className="revenue-month">{item.month}</span></div>)}
              </div>
            </article>
            <article className="panel recent-sales-panel">
              <div className="panel-heading"><div><h2>Recent sales</h2><p>Latest workspace transactions</p></div><button className="subtle-button" onClick={exportReport}>View report <ArrowUpRight size={14} /></button></div>
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
            <Metric icon={MousePointerClick} label="Total clicks" value="28,492" change="+16.4% vs last period" />
            <Metric icon={Eye} label="Unique visitors" value="12,480" change="+8.4% vs last period" />
            <Metric icon={BarChart3} label="Bounce rate" value="32.8%" change="-4.2% vs last period" />
            <Metric icon={CalendarDays} label="Avg. session" value="4m 32s" change="+12.1% vs last period" />
          </section>
          <section className="panel traffic-panel">
            <div className="panel-heading"><div><h2>Traffic activity</h2><p>Clicks and unique visitors · {period.toLowerCase()}</p></div><div className="chart-legend"><span><i className="legend-clicks" />Clicks</span><span><i className="legend-visitors" />Visitors</span></div></div>
            <div className="traffic-chart" role="img" aria-label={`Traffic clicks and visitors for ${period}`}>
              <div className="traffic-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
              <svg viewBox="0 0 700 200" preserveAspectRatio="none" aria-hidden="true">
                {[20, 62, 104, 146, 188].map((y) => <line key={y} x1="0" x2="700" y1={y} y2={y} className="chart-gridline" />)}
                <polyline points={chartPoints(current.visitors)} className="traffic-line visitors-line" />
                <polyline points={chartPoints(current.clicks)} className="traffic-line clicks-line" />
              </svg>
            </div>
            <div className="traffic-x-labels">{current.labels.map((label) => <span key={label}>{label}</span>)}</div>
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

function Metric({ icon: Icon, label, value, change }: { icon: LucideIcon; label: string; value: string; change: string }) {
  return <article className="metric-card"><div className="metric-top"><span className="metric-icon"><Icon size={17} strokeWidth={1.8} /></span></div><div className="metric-value">{value}</div><div className="metric-label">{label}</div><div className="metric-change positive"><ArrowUpRight size={14} />{change}</div></article>
}
