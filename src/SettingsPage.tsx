import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Bell, Eye, Palette, UserRound, Users, type LucideIcon } from 'lucide-react'

const STORAGE_KEY = 'northstar-settings-v1'
const NAVIGATION_OPTIONS = ['Tasks', 'Apps', 'Chats', 'Team', 'Users', 'Projects', 'Reports']

type Settings = {
  username: string
  email: string
  bio: string
  website: string
  github: string
  fullName: string
  birthday: string
  language: string
  font: string
  emailNotifications: boolean
  productUpdates: boolean
  taskReminders: boolean
  visibleNavigation: string[]
}

const defaults: Settings = {
  username: 'alex-morgan',
  email: 'alex@example.com',
  bio: 'Product lead at Northstar Studio.',
  website: 'https://example.com',
  github: '',
  fullName: 'Alex Morgan',
  birthday: '',
  language: 'English',
  font: 'Inter',
  emailNotifications: true,
  productUpdates: false,
  taskReminders: true,
  visibleNavigation: NAVIGATION_OPTIONS,
}

const sections: { label: string; icon: LucideIcon }[] = [
  { label: 'Profile', icon: UserRound },
  { label: 'Account', icon: Users },
  { label: 'Appearance', icon: Palette },
  { label: 'Notifications', icon: Bell },
  { label: 'Display', icon: Eye },
]

function readSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaults
    const value = JSON.parse(stored) as Partial<Settings>
    return {
      ...defaults,
      ...value,
      visibleNavigation: Array.isArray(value.visibleNavigation)
        ? NAVIGATION_OPTIONS.filter((item) => value.visibleNavigation?.includes(item))
        : defaults.visibleNavigation,
    }
  } catch {
    return defaults
  }
}

type SettingsPageProps = {
  darkMode: boolean
  onDarkModeChange: (value: boolean) => void
  weeklySummary: boolean
  onWeeklySummaryChange: (value: boolean) => void
  visibleNavigation: string[]
  onVisibleNavigationChange: (value: string[]) => void
  onNotify: (message: string) => void
}

export function SettingsPage({
  darkMode,
  onDarkModeChange,
  weeklySummary,
  onWeeklySummaryChange,
  visibleNavigation,
  onVisibleNavigationChange,
  onNotify,
}: SettingsPageProps) {
  const [section, setSection] = useState('Profile')
  const [settings, setSettings] = useState(readSettings)

  useEffect(() => {
    document.documentElement.style.setProperty('--settings-font', settings.font === 'Georgia' ? 'Georgia, serif' : settings.font === 'System UI' ? 'system-ui, sans-serif' : 'Inter, sans-serif')
  }, [settings.font])

  function persist(next: Settings, appearance = darkMode, summary = weeklySummary, navigation = visibleNavigation) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...next,
        darkMode: appearance,
        weeklySummary: summary,
        visibleNavigation: navigation,
      }))
      setSettings(next)
      onNotify('Settings saved on this device.')
    } catch (error) {
      console.error('Unable to save settings to local storage.', error)
      onNotify('Could not save settings. Check your browser storage and try again.')
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    persist(settings)
  }

  function toggleDarkMode() {
    const next = !darkMode
    onDarkModeChange(next)
    persist(settings, next)
  }

  function toggleWeeklySummary() {
    const next = !weeklySummary
    onWeeklySummaryChange(next)
    persist(settings, darkMode, next)
  }

  function toggleNotification(key: 'emailNotifications' | 'productUpdates' | 'taskReminders') {
    const next = { ...settings, [key]: !settings[key] }
    persist(next)
  }

  function toggleNavigation(item: string) {
    const next = visibleNavigation.includes(item)
      ? visibleNavigation.filter((label) => label !== item)
      : [...visibleNavigation, item]
    onVisibleNavigationChange(next)
    persist(settings, darkMode, weeklySummary, next)
  }

  const input = (key: keyof Settings, label: string, type = 'text', required = false) => (
    <label>{label}<input type={type} value={settings[key] as string} required={required} onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.value }))} /></label>
  )

  return (
    <section className="settings-layout">
      <nav className="settings-tabs" aria-label="Settings sections">
        {sections.map(({ label, icon: Icon }) => <button key={label} type="button" className={section === label ? 'active' : ''} onClick={() => setSection(label)}><Icon size={16} />{label}</button>)}
      </nav>
      <div className="panel settings-detail">
        {section === 'Profile' && <SettingsSection title="Profile" description="Manage your public profile and how people can reach you.">
          <form className="settings-form settings-detail-form" onSubmit={submit}>
            {input('username', 'Username', 'text', true)}
            {input('email', 'Email address', 'email', true)}
            <label>Bio<textarea value={settings.bio} maxLength={160} rows={3} onChange={(event) => setSettings((current) => ({ ...current, bio: event.target.value }))} /></label>
            {input('website', 'Website', 'url')}
            {input('github', 'GitHub profile', 'url')}
            <SaveButton />
          </form>
        </SettingsSection>}
        {section === 'Account' && <SettingsSection title="Account" description="Update personal details and regional preferences.">
          <form className="settings-form settings-detail-form" onSubmit={submit}>
            {input('fullName', 'Full name', 'text', true)}
            {input('birthday', 'Date of birth', 'date')}
            <label>Language<select value={settings.language} onChange={(event) => setSettings((current) => ({ ...current, language: event.target.value }))}><option>English</option><option>Serbian</option><option>French</option><option>German</option><option>Spanish</option></select></label>
            <p className="settings-note">Account changes are stored locally in this browser; there is no connected account service.</p>
            <SaveButton />
          </form>
        </SettingsSection>}
        {section === 'Appearance' && <SettingsSection title="Appearance" description="Personalize the visual style of your workspace.">
          <div className="settings-detail-form">
            <PreferenceRow title="Dark appearance" description="Use a darker color palette across the app." checked={darkMode} onChange={toggleDarkMode} />
            <label>Interface font<select value={settings.font} onChange={(event) => setSettings((current) => ({ ...current, font: event.target.value }))}><option>Inter</option><option>System UI</option><option>Georgia</option></select></label>
            <button className="primary-button" type="button" onClick={() => { document.documentElement.style.setProperty('--settings-font', settings.font === 'Georgia' ? 'Georgia, serif' : settings.font === 'System UI' ? 'system-ui, sans-serif' : 'Inter, sans-serif'); persist(settings) }}>Save appearance</button>
          </div>
        </SettingsSection>}
        {section === 'Notifications' && <SettingsSection title="Notifications" description="Choose which updates you want to receive.">
          <div className="settings-detail-form">
            <PreferenceRow title="Email notifications" description="Receive important workspace updates by email." checked={settings.emailNotifications} onChange={() => toggleNotification('emailNotifications')} />
            <PreferenceRow title="Product updates" description="Occasional news about new features and improvements." checked={settings.productUpdates} onChange={() => toggleNotification('productUpdates')} />
            <PreferenceRow title="Task reminders" description="Get a reminder when a task is approaching its due date." checked={settings.taskReminders} onChange={() => toggleNotification('taskReminders')} />
            <PreferenceRow title="Weekly summary" description="Get a recap of workspace activity every Monday." checked={weeklySummary} onChange={toggleWeeklySummary} />
            <p className="settings-note">Notification preferences are saved locally. No email notifications are sent.</p>
          </div>
        </SettingsSection>}
        {section === 'Display' && <SettingsSection title="Display" description="Choose which sections appear in the workspace sidebar.">
          <div className="settings-detail-form">
            {NAVIGATION_OPTIONS.map((item) => <PreferenceRow key={item} title={item} description={`Show ${item.toLowerCase()} in the main navigation.`} checked={visibleNavigation.includes(item)} onChange={() => toggleNavigation(item)} />)}
            <p className="settings-note">Overview and Settings always remain available.</p>
          </div>
        </SettingsSection>}
      </div>
    </section>
  )
}

function SettingsSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <><header className="settings-detail-heading"><h2>{title}</h2><p>{description}</p></header>{children}</>
}

function PreferenceRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: () => void }) {
  return <div className="settings-preference-row"><div><strong>{title}</strong><span>{description}</span></div><button className={`toggle${checked ? ' enabled' : ''}`} type="button" role="switch" aria-checked={checked} aria-label={title} onClick={onChange}><span /></button></div>
}

function SaveButton() {
  return <button className="primary-button" type="submit">Save changes</button>
}
