import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Blocks,
  BookOpen,
  Check,
  CreditCard,
  GitBranch,
  Hash,
  Mail,
  MessageCircle,
  Phone,
  Palette,
  Search,
  Video,
  type LucideIcon,
} from 'lucide-react'
import './AppsPage.css'

type CatalogApp = {
  name: string
  category: string
  description: string
  icon: LucideIcon
  tone: string
}

const storageKey = 'northstar-dashboard-integrations'
const catalog: CatalogApp[] = [
  { name: 'Chatline', category: 'Communication', description: 'Bring team conversations and project updates into one place.', icon: MessageCircle, tone: 'violet' },
  { name: 'Cloudmail', category: 'Communication', description: 'Keep an eye on shared inbox activity from your workspace.', icon: Mail, tone: 'blue' },
  { name: 'Code Forge', category: 'Development', description: 'Follow code reviews, releases, and project activity.', icon: GitBranch, tone: 'slate' },
  { name: 'Designboard', category: 'Design', description: 'Share design files and collect feedback from your team.', icon: Palette, tone: 'pink' },
  { name: 'Flowboard', category: 'Productivity', description: 'Bring project boards and task updates together.', icon: Blocks, tone: 'orange' },
  { name: 'Meetspace', category: 'Communication', description: 'Keep meeting links and team sessions close at hand.', icon: Video, tone: 'cyan' },
  { name: 'Paydesk', category: 'Finance', description: 'Review payment activity and billing events.', icon: CreditCard, tone: 'green' },
  { name: 'Papertrail', category: 'Productivity', description: 'Find project notes, documents, and shared knowledge.', icon: BookOpen, tone: 'amber' },
  { name: 'Signal chat', category: 'Communication', description: 'Keep important team messages easy to find.', icon: Hash, tone: 'blue' },
  { name: 'Source control', category: 'Development', description: 'Stay up to date with changes to your code projects.', icon: GitBranch, tone: 'orange' },
  { name: 'Voice room', category: 'Communication', description: 'Coordinate calls and quick conversations with teammates.', icon: Phone, tone: 'green' },
]

function readConnectedApps(): string[] {
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return ['Papertrail', 'Designboard', 'Meetspace', 'Cloudmail']
    const parsed: unknown = JSON.parse(saved)
    if (Array.isArray(parsed) && parsed.every((name) => typeof name === 'string' && catalog.some((app) => app.name === name))) {
      return parsed
    }
    throw new Error('Saved integration data has an unexpected format.')
  } catch (error) {
    console.error('Could not load saved integrations.', error)
    return []
  }
}

export function AppsPage({
  search,
  onSearchChange,
  onNotify,
}: {
  search: string
  onSearchChange: (value: string) => void
  onNotify: (message: string) => void
}) {
  const [connectedApps, setConnectedApps] = useState(readConnectedApps)
  const [connectionFilter, setConnectionFilter] = useState('All integrations')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [ascending, setAscending] = useState(true)

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(connectedApps))
    } catch (error) {
      console.error('Could not save integration choices.', error)
      onNotify('Integration choices could not be saved in this browser.')
    }
  }, [connectedApps, onNotify])

  const categories = useMemo(() => [...new Set(catalog.map((app) => app.category))].sort(), [])
  const filteredApps = useMemo(() => {
    const query = search.trim().toLowerCase()
    return catalog
      .filter((app) => !query || `${app.name} ${app.category} ${app.description}`.toLowerCase().includes(query))
      .filter((app) => categoryFilter === 'All categories' || app.category === categoryFilter)
      .filter((app) => connectionFilter === 'All integrations' || (connectionFilter === 'Connected' ? connectedApps.includes(app.name) : !connectedApps.includes(app.name)))
      .sort((first, second) => ascending ? first.name.localeCompare(second.name) : second.name.localeCompare(first.name))
  }, [search, categoryFilter, connectionFilter, connectedApps, ascending])

  function toggleConnection(app: CatalogApp) {
    const isConnected = connectedApps.includes(app.name)
    setConnectedApps((current) => isConnected ? current.filter((name) => name !== app.name) : [...current, app.name])
    onNotify(isConnected
      ? `${app.name} disconnected. This demo changes only this browser’s saved state.`
      : `${app.name} marked connected in this demo. Add provider credentials to enable a real connection.`)
  }

  return (
    <section className="apps-workspace">
      <div className="apps-toolbar">
        <label className="apps-search"><Search size={15} /><input aria-label="Filter integrations" placeholder="Search integrations..." value={search} onChange={(event) => onSearchChange(event.target.value)} /><kbd>⌘ K</kbd></label>
        <div className="apps-filter-group">
          <label className="task-filter"><select aria-label="Filter integrations by connection" value={connectionFilter} onChange={(event) => setConnectionFilter(event.target.value)}><option>All integrations</option><option>Connected</option><option>Not connected</option></select></label>
          <label className="task-filter"><select aria-label="Filter integrations by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <button className="apps-sort-button" aria-label={ascending ? 'Sort descending' : 'Sort ascending'} onClick={() => setAscending((current) => !current)}>{ascending ? <ArrowDownAZ size={16} /> : <ArrowUpAZ size={16} />}<span>{ascending ? 'A–Z' : 'Z–A'}</span></button>
        </div>
      </div>

      <div className="apps-result-count"><span>{filteredApps.length} {filteredApps.length === 1 ? 'integration' : 'integrations'}</span><span>{connectedApps.length} connected in this browser</span></div>
      {filteredApps.length > 0 ? <div className="apps-grid">{filteredApps.map((app) => {
        const Icon = app.icon
        const connected = connectedApps.includes(app.name)
        return <article className="integration-card" key={app.name}>
          <div className="integration-card-top"><span className={`integration-icon integration-icon-${app.tone}`}><Icon size={20} strokeWidth={1.8} /></span><button className={`integration-button${connected ? ' is-connected' : ''}`} onClick={() => toggleConnection(app)}>{connected && <Check size={13} />}{connected ? 'Connected' : 'Connect'}</button></div>
          <span className="integration-category">{app.category}</span>
          <h2>{app.name}</h2>
          <p>{app.description}</p>
          <div className="integration-card-foot"><span className={`integration-state${connected ? ' is-connected' : ''}`}><i />{connected ? 'Enabled' : 'Not connected'}</span><span className="demo-caption">Local demo</span></div>
        </article>
      })}</div> : <div className="apps-empty"><Search size={20} /><strong>No integrations found</strong><span>Try a different search or update your filters.</span><button onClick={() => { onSearchChange(''); setConnectionFilter('All integrations'); setCategoryFilter('All categories') }}>Clear filters</button></div>}
      <div className="apps-demo-note"><span className="demo-note-mark">i</span><p>Connections are a local demo only. Linking an actual service requires its authorization flow and credentials.</p></div>
    </section>
  )
}
