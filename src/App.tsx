import { useCallback, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  ListTodo,
  Menu,
  MessagesSquare,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import './App.css'
import { AppsPage } from './AppsPage'
import { AuthPage } from './AuthPage'
import { ChatsPage } from './ChatsPage'
import { DashboardPage } from './DashboardPage'
import { SettingsPage } from './SettingsPage'
import { TasksPage } from './TasksPage'
import { UsersPage } from './UsersPage'

type Page = 'Overview' | 'Tasks' | 'Apps' | 'Chats' | 'Team' | 'Users' | 'Projects' | 'Reports' | 'Settings' | 'Auth'
type ProjectStatus = 'On track' | 'In review' | 'At risk'

type Project = {
  name: string
  category: string
  initials: string
  color: string
  progress: number
  due: string
  status: ProjectStatus
}

const navigation: { label: Page; icon: LucideIcon }[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Tasks', icon: ListTodo },
  { label: 'Apps', icon: Package },
  { label: 'Chats', icon: MessagesSquare },
  { label: 'Team', icon: Users },
  { label: 'Users', icon: UserRound },
  { label: 'Projects', icon: FolderKanban },
  { label: 'Reports', icon: Activity },
  { label: 'Settings', icon: Settings },
  { label: 'Auth', icon: KeyRound },
]

const initialProjects: Project[] = [
  {
    name: 'Website refresh',
    category: 'Design · Development',
    initials: 'WR',
    color: 'lavender',
    progress: 78,
    due: 'Oct 24, 2026',
    status: 'On track',
  },
  {
    name: 'Mobile experience',
    category: 'Product · Design',
    initials: 'ME',
    color: 'mint',
    progress: 54,
    due: 'Oct 29, 2026',
    status: 'In review',
  },
  {
    name: 'Customer insights',
    category: 'Research · Analytics',
    initials: 'CI',
    color: 'peach',
    progress: 32,
    due: 'Nov 03, 2026',
    status: 'At risk',
  },
  {
    name: 'Brand toolkit',
    category: 'Brand · Design',
    initials: 'BT',
    color: 'blue',
    progress: 91,
    due: 'Nov 12, 2026',
    status: 'On track',
  },
]

const team = [
  { name: 'Olivia Rhye', role: 'Product designer', email: 'olivia@example.com', initials: 'OR', color: 'lavender', status: 'Active' },
  { name: 'Phoenix Baker', role: 'Engineering lead', email: 'phoenix@example.com', initials: 'PB', color: 'peach', status: 'Active' },
  { name: 'Lana Steiner', role: 'Product manager', email: 'lana@example.com', initials: 'LS', color: 'mint', status: 'Away' },
  { name: 'Demi Wilkinson', role: 'Researcher', email: 'demi@example.com', initials: 'DW', color: 'blue', status: 'Active' },
  { name: 'Candice Wu', role: 'Frontend developer', email: 'candice@example.com', initials: 'CW', color: 'rose', status: 'Active' },
]

const chartValues = [33, 40, 36, 53, 48, 62, 56, 66, 60, 79, 71, 88]

function readPreference(key: string, fallback: boolean) {
  try {
    const saved = JSON.parse(localStorage.getItem('northstar-settings-v1') || '{}') as Record<string, unknown>
    return typeof saved[key] === 'boolean' ? saved[key] as boolean : fallback
  } catch {
    return fallback
  }
}

function readVisibleNavigation() {
  try {
    const saved = JSON.parse(localStorage.getItem('northstar-settings-v1') || '{}') as { visibleNavigation?: unknown }
    const options = navigation.map(({ label }) => label).filter((label) => !['Overview', 'Settings', 'Auth'].includes(label))
    const visible = saved.visibleNavigation
    return Array.isArray(visible)
      ? options.filter((label) => visible.includes(label))
      : options
  } catch {
    return navigation.map(({ label }) => label).filter((label) => !['Overview', 'Settings', 'Auth'].includes(label))
  }
}

function App() {
  const [page, setPage] = useState<Page>('Overview')
  const [projects, setProjects] = useState(initialProjects)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('Last 30 days')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [notice, setNotice] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => readPreference('darkMode', false))
  const [weeklySummary, setWeeklySummary] = useState(() => readPreference('weeklySummary', true))
  const [visibleNavigation, setVisibleNavigation] = useState<string[]>(readVisibleNavigation)
  const notify = useCallback((message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3200)
  }, [])

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) =>
        `${project.name} ${project.category} ${project.status}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [projects, search],
  )

  const filteredTeam = useMemo(
    () =>
      team.filter((member) =>
        `${member.name} ${member.role} ${member.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  )

  if (page === 'Auth') {
    return (
      <div className="auth-demo-shell">
        <AuthPage onExit={() => setPage('Overview')} onNotify={notify} />
        {notice && <div className="toast" role="status"><Check size={17} />{notice}<button className="icon-button" aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={15} /></button></div>}
      </div>
    )
  }

  function addProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = projectName.trim()
    if (!name) return

    setProjects((current) => [
      {
        name,
        category: 'General · Planning',
        initials: name
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase())
          .join(''),
        color: 'blue',
        progress: 0,
        due: 'Not scheduled',
        status: 'On track',
      },
      ...current,
    ])
    setProjectName('')
    setShowProjectForm(false)
    setPage('Projects')
    setNotice('Your project has been added.')
    window.setTimeout(() => setNotice(''), 3200)
  }

  return (
    <div className={`app-shell${darkMode ? ' dark-mode' : ''}`}>
      <aside className={`sidebar${menuOpen ? ' sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={19} strokeWidth={2.4} /></div>
          <span>northstar</span>
          <button className="icon-button sidebar-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <button className="workspace-switcher" onClick={() => setNotice('You are viewing the Northstar workspace.')}>
          <span className="workspace-avatar">N</span>
          <span className="workspace-copy"><strong>Northstar Studio</strong><small>Free workspace</small></span>
          <ChevronDown size={16} />
        </button>

        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.filter(({ label }) => ['Overview', 'Settings', 'Auth'].includes(label) || visibleNavigation.includes(label)).map(({ label, icon: Icon }) => (
            <button
              className={`nav-item${page === label ? ' active' : ''}`}
              key={label}
              onClick={() => {
                setPage(label)
                setSearch('')
                setMenuOpen(false)
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === 'Projects' && <span className="nav-count">{projects.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="plan-card">
          <div className="plan-icon"><Sparkles size={16} /></div>
          <strong>Make room for more</strong>
          <p>Upgrade your workspace to unlock more projects and insights.</p>
          <button onClick={() => setNotice('Plan options are coming soon.')}>Explore plans <ArrowUpRight size={14} /></button>
        </div>
        <button className="nav-item help-link" onClick={() => setNotice('Help center is ready for your questions.')}>
          <CircleHelp size={18} strokeWidth={1.8} /><span>Help center</span>
        </button>
        <div className="profile">
          <div className="avatar avatar-lavender">AM</div>
          <div className="profile-copy"><strong>Alex Morgan</strong><small>alex@example.com</small></div>
          <button className="icon-button" aria-label="More profile options" onClick={() => setNotice('Signed in as Alex Morgan.')}>
            <MoreHorizontal size={19} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-divider">/</span><strong>{page}</strong></div>
          <div className="topbar-actions">
            <button className="icon-button mobile-search-toggle" aria-label="Toggle search" onClick={() => setSearchOpen((current) => !current)}><Search size={18} /></button>
            <label className={`search-box${searchOpen ? ' search-open' : ''}`}>
              <Search size={17} />
              <input aria-label="Search workspace" placeholder="Search anything..." value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false) }} />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotice('You are all caught up.')}>
              <Bell size={18} /><span className="notification-dot" />
            </button>
            <div className="avatar avatar-lavender topbar-avatar">AM</div>
          </div>
        </header>

        <div className="page-content">
          {page === 'Overview' && (
            <DashboardPage
              projects={filteredProjects}
              onCreateProject={() => setShowProjectForm(true)}
              onProjects={() => setPage('Projects')}
              onNotify={notify}
            />
          )}

          {page === 'Projects' && (
            <>
              <PageHeading title="Projects" subtitle="Plan, track, and ship great work together." action={<button className="primary-button" onClick={() => setShowProjectForm(true)}><Plus size={17} /> New project</button>} />
              <div className="projects-toolbar"><span>{filteredProjects.length} projects</span><button className="subtle-button" onClick={() => setSearch('')}><X size={14} /> Clear search</button></div>
              <section className="panel projects-panel standalone-panel"><ProjectTable projects={filteredProjects} /></section>
            </>
          )}

          {page === 'Tasks' && (
            <>
              <PageHeading title="Tasks" subtitle="Organize priorities and keep your work moving." />
              <TasksPage search={search} onSearchChange={setSearch} onNotify={notify} />
            </>
          )}

          {page === 'Team' && (
            <>
              <PageHeading title="Team" subtitle="The people making good things happen." action={<button className="primary-button" onClick={() => setNotice('An invitation link is ready to share.')}><Plus size={17} /> Invite people</button>} />
              <section className="panel directory-panel">
                <div className="panel-heading"><div><h2>Workspace members</h2><p>Manage people and their workspace access</p></div><span className="member-count">24 members</span></div>
                <div className="member-list">
                  {filteredTeam.map((member) => <div className="member-row" key={member.email}><div className={`avatar avatar-${member.color}`}>{member.initials}</div><div className="member-name"><strong>{member.name}</strong><span>{member.email}</span></div><span className="member-role">{member.role}</span><span className={`member-status${member.status === 'Away' ? ' away' : ''}`}><i />{member.status}</span><button className="icon-button" aria-label={`Options for ${member.name}`} onClick={() => setNotice(`${member.name} is a ${member.role.toLowerCase()}.`)}><MoreHorizontal size={18} /></button></div>)}
                  {filteredTeam.length === 0 && <EmptyState message="No team members match your search." />}
                </div>
              </section>
              <div className="team-note"><ShieldCheck size={17} /><span>Only workspace admins can change member roles and access.</span></div>
            </>
          )}

          {page === 'Users' && (
            <>
              <PageHeading title="Users" subtitle="Manage workspace members and their access." />
              <UsersPage search={search} onSearchChange={setSearch} onNotify={notify} />
            </>
          )}

          {page === 'Apps' && (
            <>
              <PageHeading title="App integrations" subtitle="Choose the tools your workspace connects with." />
              <AppsPage search={search} onSearchChange={setSearch} onNotify={notify} />
            </>
          )}

          {page === 'Chats' && (
            <>
              <PageHeading title="Messages" subtitle="A small shared inbox for your workspace conversations." />
              <ChatsPage onNotify={notify} />
            </>
          )}

          {page === 'Reports' && (
            <>
              <PageHeading title="Reports" subtitle="A clearer picture of your team’s momentum." action={<button className="secondary-button" onClick={() => setNotice('Your report is ready to export.')}><ArrowDownRight size={16} /> Export report</button>} />
              <section className="metrics-grid report-metrics"><MetricCard icon={Activity} label="Total activity" value="1,842" change="+18.6% this period" positive /><MetricCard icon={Check} label="Tasks completed" value="186" change="+12% this period" positive /><MetricCard icon={Users} label="Active contributors" value="18" change="75% of your team" positive /><MetricCard icon={Clock3} label="Avg. response time" value="2.4h" change="Down 16% this period" positive /></section>
              <section className="panel report-panel"><div className="panel-heading"><div><h2>Team activity</h2><p>Daily activity over {period.toLowerCase()}</p></div><label className="select-control compact-select"><select aria-label="Report period" value={period} onChange={(event) => setPeriod(event.target.value)}><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option></select><ChevronDown size={15} /></label></div><div className="report-bars">{chartValues.map((height, index) => <div className="bar-column" key={`${height}-${index}`}><div className="bar-value" style={{ height: `${height}%` }} /><span>{['Sep 15', 'Sep 20', 'Sep 25', 'Sep 30', 'Oct 05', 'Oct 10'][index % 6]}</span></div>)}</div></section>
            </>
          )}

          {page === 'Settings' && (
            <>
              <PageHeading title="Settings" subtitle="Manage your profile, account, and workspace preferences." />
              <SettingsPage
                darkMode={darkMode}
                onDarkModeChange={setDarkMode}
                weeklySummary={weeklySummary}
                onWeeklySummaryChange={setWeeklySummary}
                visibleNavigation={visibleNavigation}
                onVisibleNavigationChange={(visible) => {
                  setVisibleNavigation(visible)
                  if (!['Overview', 'Settings', 'Auth'].includes(page) && !visible.includes(page)) setPage('Overview')
                }}
                onNotify={notify}
              />
            </>
          )}
        </div>
      </main>

      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      {notice && <div className="toast" role="status"><Check size={17} />{notice}<button className="icon-button" aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={15} /></button></div>}
      {showProjectForm && <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowProjectForm(false) }}><form className="project-modal" onSubmit={addProject}><button className="icon-button modal-close" type="button" aria-label="Close dialog" onClick={() => setShowProjectForm(false)}><X size={18} /></button><div className="modal-icon"><FolderKanban size={20} /></div><h2>Create a project</h2><p>Start with a name. You can add details and invite people later.</p><label htmlFor="project-name">Project name</label><input id="project-name" autoFocus required placeholder="e.g. Product launch" value={projectName} onChange={(event) => setProjectName(event.target.value)} /><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowProjectForm(false)}>Cancel</button><button className="primary-button" type="submit">Create project</button></div></form></div>}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, change, positive }: { icon: LucideIcon; label: string; value: string; change: string; positive: boolean }) {
  return <article className="metric-card"><div className="metric-top"><span className="metric-icon"><Icon size={17} strokeWidth={1.8} /></span><button className="icon-button metric-menu" aria-label={`More about ${label}`}><MoreHorizontal size={18} /></button></div><div className="metric-value">{value}</div><div className="metric-label">{label}</div><div className={`metric-change${positive ? ' positive' : ''}`}><ArrowUpRight size={14} />{change}</div></article>
}

function PageHeading({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return <section className="page-heading simple-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> NORTHSTAR STUDIO</div><h1>{title}</h1><p className="page-subtitle">{subtitle}</p></div>{action && <div className="heading-actions">{action}</div>}</section>
}

function ProjectTable({ projects }: { projects: Project[] }) {
  return <div className="table-scroll"><table className="project-table"><thead><tr><th>PROJECT</th><th>STATUS</th><th>PROGRESS</th><th>DUE DATE</th><th><span className="sr-only">Options</span></th></tr></thead><tbody>{projects.map((project) => <tr key={`${project.name}-${project.due}`}><td><div className="project-name-cell"><div className={`project-avatar ${project.color}`}>{project.initials || 'P'}</div><div><strong>{project.name}</strong><span>{project.category}</span></div></div></td><td><span className={`status status-${project.status.toLowerCase().replace(' ', '-')}`}><i />{project.status}</span></td><td><div className="progress-cell"><div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div><span>{project.progress}%</span></div></td><td className="due-date">{project.due}</td><td><button className="icon-button row-menu" aria-label={`More options for ${project.name}`}><MoreHorizontal size={18} /></button></td></tr>)}{projects.length === 0 && <tr><td colSpan={5}><EmptyState message="No projects match your search." /></td></tr>}</tbody></table></div>
}

function EmptyState({ message }: { message: string }) {
  return <div className="empty-state"><Search size={18} /><span>{message}</span></div>
}

export default App
