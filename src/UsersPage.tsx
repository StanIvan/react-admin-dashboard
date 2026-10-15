import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MailPlus,
  Search,
  Shield,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react'
import './UsersPage.css'

type UserRole = 'Admin' | 'Editor' | 'Viewer'
type UserStatus = 'Active' | 'Invited' | 'Suspended'
type User = {
  name: string
  email: string
  role: UserRole
  status: UserStatus
}

const storageKey = 'northstar-dashboard-users'
const pageSize = 8
const roles: UserRole[] = ['Admin', 'Editor', 'Viewer']
const statuses: UserStatus[] = ['Active', 'Invited', 'Suspended']
const isRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && roles.some((role) => role === value)
const isStatus = (value: unknown): value is UserStatus =>
  typeof value === 'string' && statuses.some((status) => status === value)
const starterUsers: User[] = [
  { name: 'Olivia Rhye', email: 'olivia@example.com', role: 'Admin', status: 'Active' },
  { name: 'Phoenix Baker', email: 'phoenix@example.com', role: 'Editor', status: 'Active' },
  { name: 'Lana Steiner', email: 'lana@example.com', role: 'Admin', status: 'Active' },
  { name: 'Demi Wilkinson', email: 'demi@example.com', role: 'Viewer', status: 'Active' },
  { name: 'Candice Wu', email: 'candice@example.com', role: 'Editor', status: 'Active' },
  { name: 'Natali Craig', email: 'natali@example.com', role: 'Viewer', status: 'Invited' },
  { name: 'Drew Cano', email: 'drew@example.com', role: 'Editor', status: 'Active' },
  { name: 'Orlando Diggs', email: 'orlando@example.com', role: 'Viewer', status: 'Suspended' },
  { name: 'Andi Lane', email: 'andi@example.com', role: 'Editor', status: 'Active' },
  { name: 'Kate Morrison', email: 'kate@example.com', role: 'Viewer', status: 'Invited' },
  { name: 'Demi Wilkinson', email: 'demi.w@example.com', role: 'Viewer', status: 'Active' },
]

function isUser(item: unknown): item is User {
  return (
    typeof item === 'object' &&
    item !== null &&
    'name' in item &&
    typeof item.name === 'string' &&
    'email' in item &&
    typeof item.email === 'string' &&
    'role' in item &&
    isRole(item.role) &&
    'status' in item &&
    isStatus(item.status)
  )
}

function loadUsers(): User[] {
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return starterUsers
    const parsed: unknown = JSON.parse(saved)
    if (
      Array.isArray(parsed) &&
      parsed.every(isUser)
    ) {
      return parsed
    }
    throw new Error('Saved user data has an unexpected format.')
  } catch (error) {
    console.error('Could not load saved users.', error)
    return starterUsers
  }
}

export function UsersPage({
  search,
  onSearchChange,
  onNotify,
}: {
  search: string
  onSearchChange: (value: string) => void
  onNotify: (message: string) => void
}) {
  const [users, setUsers] = useState(loadUsers)
  const [roleFilter, setRoleFilter] = useState('All roles')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [page, setPage] = useState(1)
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [dialog, setDialog] = useState<'invite' | 'edit' | 'delete' | null>(null)
  const [currentEmail, setCurrentEmail] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('Viewer')
  const [pendingDelete, setPendingDelete] = useState<string[]>([])
  const [formError, setFormError] = useState('')

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(users))
    } catch (error) {
      console.error('Could not save users to local storage.', error)
      onNotify('User changes could not be saved in this browser.')
    }
  }, [users, onNotify])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return users
      .filter((user) => !query || `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query))
      .filter((user) => roleFilter === 'All roles' || user.role === roleFilter)
      .filter((user) => statusFilter === 'All statuses' || user.status === statusFilter)
      .sort((first, second) => first.name.localeCompare(second.name))
  }, [users, search, roleFilter, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const allVisibleSelected = visibleUsers.length > 0 && visibleUsers.every((user) => selectedEmails.includes(user.email))
  const activeCount = users.filter((user) => user.status === 'Active').length
  const invitedCount = users.filter((user) => user.status === 'Invited').length

  function openInvite() {
    setName('')
    setEmail('')
    setRole('Viewer')
    setFormError('')
    setDialog('invite')
  }

  function openEdit(user: User) {
    setCurrentEmail(user.email)
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setFormError('')
    setDialog('edit')
  }

  function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedName = name.trim()
    if (!normalizedName) {
      setFormError('Name cannot be blank.')
      return
    }
    if (!normalizedEmail) {
      setFormError('Email address is required.')
      return
    }
    if (users.some((user) => user.email.toLowerCase() === normalizedEmail && user.email !== currentEmail)) {
      setFormError('A user with this email address already exists.')
      return
    }

    if (dialog === 'edit') {
      setUsers((current) => current.map((user) => user.email === currentEmail ? { ...user, name: normalizedName, email: normalizedEmail, role } : user))
      onNotify('User details updated.')
    } else {
      setUsers((current) => [{ name: normalizedName, email: normalizedEmail, role, status: 'Invited' }, ...current])
      onNotify('Invitation added. Connect an email service to send it.')
    }
    setDialog(null)
  }

  function deleteUsers(emails: string[]) {
    setUsers((current) => current.filter((user) => !emails.includes(user.email)))
    setSelectedEmails((current) => current.filter((selected) => !emails.includes(selected)))
    setPendingDelete([])
    setDialog(null)
    onNotify(emails.length === 1 ? 'User removed.' : `${emails.length} users removed.`)
  }

  function toggleUser(userEmail: string) {
    setSelectedEmails((current) => current.includes(userEmail) ? current.filter((selected) => selected !== userEmail) : [...current, userEmail])
  }

  return (
    <section className="users-workspace">
      <div className="user-summary-grid">
        <article><span>Total members</span><strong>{users.length}</strong><small>In this workspace</small></article>
        <article><span>Active</span><strong>{activeCount}</strong><small>Can access the workspace</small></article>
        <article><span>Invitations pending</span><strong>{invitedCount}</strong><small>Waiting to be accepted</small></article>
      </div>

      <div className="users-list-card">
        <div className="users-toolbar">
          <div><h2>Workspace users</h2><p>Invite people and manage their permissions.</p></div>
          <button className="task-primary-button" onClick={openInvite}><UserPlus size={15} /> Invite user</button>
        </div>
        <div className="users-filterbar">
          <label className="users-search"><Search size={15} /><input aria-label="Filter users" placeholder="Filter by name or email..." value={search} onChange={(event) => onSearchChange(event.target.value)} /><kbd>⌘ K</kbd></label>
          <label className="task-filter"><select aria-label="Filter users by role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option>All roles</option>{roles.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
          <label className="task-filter"><select aria-label="Filter users by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
        </div>
        {selectedEmails.length > 0 && <div className="users-selection"><span>{selectedEmails.length} selected</span><button onClick={() => { setPendingDelete(selectedEmails); setDialog('delete') }}><Trash2 size={14} /> Remove selected</button></div>}
        <div className="users-table-scroll">
          <table className="users-table">
            <thead><tr><th><input aria-label="Select all visible users" type="checkbox" checked={allVisibleSelected} onChange={(event) => setSelectedEmails((current) => event.target.checked ? [...new Set([...current, ...visibleUsers.map((user) => user.email)])] : current.filter((item) => !visibleUsers.some((user) => user.email === item)))} /></th><th>USER</th><th>ROLE</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {visibleUsers.map((user) => <tr key={user.email}>
                <td><input aria-label={`Select ${user.name}`} type="checkbox" checked={selectedEmails.includes(user.email)} onChange={() => toggleUser(user.email)} /></td>
                <td><div className="user-identity"><span className={`user-avatar user-avatar-${user.name.charCodeAt(0) % 5}`}>{user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><strong>{user.name}</strong><span>{user.email}</span></div></div></td>
                <td><span className={`user-role user-role-${user.role.toLowerCase()}`}>{user.role === 'Admin' && <Shield size={12} />}{user.role}</span></td>
                <td><span className={`user-status user-status-${user.status.toLowerCase()}`}><i />{user.status}</span></td>
                <td><div className="user-actions"><button aria-label={`Edit ${user.name}`} onClick={() => openEdit(user)}>Edit</button>{user.status === 'Invited' && <button aria-label={`Resend invitation to ${user.name}`} onClick={() => onNotify(`Invitation for ${user.email} is ready to resend.`)}><MailPlus size={14} /></button>}<button aria-label={`Remove ${user.name}`} onClick={() => { setPendingDelete([user.email]); setDialog('delete') }}><Trash2 size={14} /></button></div></td>
              </tr>)}
              {visibleUsers.length === 0 && <tr><td colSpan={5}><div className="users-empty"><Search size={18} /><span>No users match these filters.</span><button onClick={() => { onSearchChange(''); setRoleFilter('All roles'); setStatusFilter('All statuses') }}>Clear filters</button></div></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="task-pagination"><span>Showing {filteredUsers.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}</span><div><button aria-label="Previous users page" disabled={currentPage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={16} /></button><span>Page {currentPage} of {pageCount}</span><button aria-label="Next users page" disabled={currentPage >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><ChevronRight size={16} /></button></div></div>
      </div>

      {dialog && <div className="task-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null) }}>
        {(dialog === 'invite' || dialog === 'edit') && <form className="task-modal" onSubmit={saveUser}>
          <button className="task-modal-close" type="button" aria-label="Close dialog" onClick={() => setDialog(null)}><X size={17} /></button>
          <div className="task-modal-icon"><UserPlus size={19} /></div><h2>{dialog === 'edit' ? 'Edit user' : 'Invite a user'}</h2><p>{dialog === 'edit' ? 'Update this user’s workspace details and role.' : 'Add a teammate to your workspace.'}</p>
          <label className="task-form-field">Full name<input required autoFocus maxLength={80} value={name} onChange={(event) => { setName(event.target.value); setFormError('') }} placeholder="e.g. Jordan Lee" /></label>
          <label className="task-form-field">Email address<input required type="email" value={email} onChange={(event) => { setEmail(event.target.value); setFormError('') }} placeholder="name@example.com" /></label>
          <label className="task-form-field">Role<select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>{roles.map((item) => <option key={item}>{item}</option>)}</select></label>
          {formError && <p className="users-form-error" role="alert">{formError}</p>}
          <div className="task-modal-actions"><button className="task-secondary-button" type="button" onClick={() => setDialog(null)}>Cancel</button><button className="task-primary-button" type="submit">{dialog === 'edit' ? 'Save changes' : 'Add invitation'}</button></div>
        </form>}
        {dialog === 'delete' && <div className="task-modal"><button className="task-modal-close" type="button" aria-label="Close dialog" onClick={() => setDialog(null)}><X size={17} /></button><div className="task-modal-icon task-delete-icon"><Trash2 size={19} /></div><h2>Remove {pendingDelete.length === 1 ? 'user' : 'users'}?</h2><p>This will remove {pendingDelete.length} {pendingDelete.length === 1 ? 'user' : 'users'} from this workspace.</p><div className="task-modal-actions"><button className="task-secondary-button" onClick={() => setDialog(null)}>Cancel</button><button className="task-danger-button" onClick={() => deleteUsers(pendingDelete)}>Remove</button></div></div>}
      </div>}
    </section>
  )
}
