import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ArrowDownToLine,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  ListTodo,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import {
  readCsvTaskDrafts,
  taskLabels as labels,
  taskPriorities as priorities,
  taskStatuses as statuses,
  type TaskDraft,
  type TaskLabel,
  type TaskPriority,
  type TaskStatus,
} from './taskCsv'
import './TasksPage.css'

type Task = {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  label: TaskLabel
}

const storageKey = 'northstar-dashboard-tasks'
const pageSize = 8
let taskIdSequence = 0

const starterTasks: Task[] = [
  { id: 'TASK-1001', title: 'Add account recovery flow', status: 'In progress', priority: 'High', label: 'Feature' },
  { id: 'TASK-1002', title: 'Fix responsive navigation on tablets', status: 'Todo', priority: 'High', label: 'Bug' },
  { id: 'TASK-1003', title: 'Document the new onboarding steps', status: 'Backlog', priority: 'Low', label: 'Documentation' },
  { id: 'TASK-1004', title: 'Review dashboard empty states', status: 'Todo', priority: 'Medium', label: 'Feature' },
  { id: 'TASK-1005', title: 'Resolve date picker timezone issue', status: 'In progress', priority: 'Medium', label: 'Bug' },
  { id: 'TASK-1006', title: 'Update project setup guide', status: 'Done', priority: 'Low', label: 'Documentation' },
  { id: 'TASK-1007', title: 'Add keyboard shortcuts to search', status: 'Backlog', priority: 'Medium', label: 'Feature' },
  { id: 'TASK-1008', title: 'Investigate duplicated notifications', status: 'Todo', priority: 'High', label: 'Bug' },
  { id: 'TASK-1009', title: 'Improve activity chart labels', status: 'Done', priority: 'Low', label: 'Feature' },
  { id: 'TASK-1010', title: 'Clarify team invitation permissions', status: 'In progress', priority: 'Medium', label: 'Documentation' },
  { id: 'TASK-1011', title: 'Remove stale account preferences', status: 'Canceled', priority: 'Low', label: 'Bug' },
  { id: 'TASK-1012', title: 'Add export options to reports', status: 'Todo', priority: 'High', label: 'Feature' },
]

const blankDraft: TaskDraft = {
  title: '',
  status: 'Todo',
  priority: 'Medium',
  label: 'Feature',
}

function readSavedTasks(): Task[] {
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return starterTasks
    const parsed: unknown = JSON.parse(saved)
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (item): item is Task =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          statuses.includes(item.status) &&
          priorities.includes(item.priority) &&
          labels.includes(item.label),
      )
    ) {
      return parsed
    }
    throw new Error('Saved task data has an unexpected format.')
  } catch (error) {
    console.error('Could not load saved tasks.', error)
    return starterTasks
  }
}

function createTaskId(): string {
  const suffix = String(taskIdSequence++).padStart(3, '0')
  return `TASK-${Date.now()}-${suffix}`
}

export function TasksPage({
  search,
  onSearchChange,
  onNotify,
}: {
  search: string
  onSearchChange: (value: string) => void
  onNotify: (message: string) => void
}) {
  const [tasks, setTasks] = useState(readSavedTasks)
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [sort, setSort] = useState('Newest first')
  const pageFilterKey = JSON.stringify([search, statusFilter, priorityFilter, sort])
  const [pageState, setPageState] = useState({ filterKey: pageFilterKey, page: 1 })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([])
  const [draft, setDraft] = useState<TaskDraft>(blankDraft)
  const [dialog, setDialog] = useState<'task' | 'import' | 'delete' | null>(null)
  const [importError, setImportError] = useState('')
  const [importing, setImporting] = useState(false)
  const [taskError, setTaskError] = useState('')

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(tasks))
    } catch (error) {
      console.error('Could not save tasks to local storage.', error)
      onNotify('Tasks could not be saved in this browser.')
    }
  }, [tasks, onNotify])

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase()
    return tasks
      .filter((task) => !query || `${task.id} ${task.title}`.toLowerCase().includes(query))
      .filter((task) => statusFilter === 'All statuses' || task.status === statusFilter)
      .filter((task) => priorityFilter === 'All priorities' || task.priority === priorityFilter)
      .sort((first, second) => {
        if (sort === 'Title A–Z') return first.title.localeCompare(second.title)
        if (sort === 'Priority') return priorities.indexOf(first.priority) - priorities.indexOf(second.priority)
        return second.id.localeCompare(first.id)
      })
  }, [tasks, search, statusFilter, priorityFilter, sort])

  if (pageState.filterKey !== pageFilterKey) {
    setPageState({ filterKey: pageFilterKey, page: 1 })
  }
  const pageCount = Math.max(1, Math.ceil(filteredTasks.length / pageSize))
  const currentPage = Math.min(pageState.page, pageCount)
  const visibleTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const allVisibleSelected = visibleTasks.length > 0 && visibleTasks.every((task) => selectedIds.includes(task.id))

  function setPage(nextPage: number | ((current: number) => number)) {
    setPageState((current) => ({
      filterKey: pageFilterKey,
      page: typeof nextPage === 'function'
        ? nextPage(current.filterKey === pageFilterKey ? current.page : 1)
        : nextPage,
    }))
  }

  function openCreate() {
    setEditingTask(null)
    setDraft(blankDraft)
    setTaskError('')
    setDialog('task')
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setDraft({ title: task.title, status: task.status, priority: task.priority, label: task.label })
    setTaskError('')
    setDialog('task')
  }

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = draft.title.trim()
    if (!title) {
      setTaskError('Task title cannot be blank.')
      return
    }
    if (editingTask) {
      setTasks((current) => current.map((task) => task.id === editingTask.id ? { ...editingTask, ...draft, title } : task))
      onNotify('Task updated.')
    } else {
      setTasks((current) => [{ ...draft, title, id: createTaskId() }, ...current])
      setPage(1)
      onNotify('Task created.')
    }
    setDialog(null)
  }

  function deleteTasks(ids: string[]) {
    setTasks((current) => current.filter((task) => !ids.includes(task.id)))
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)))
    setDialog(null)
    onNotify(ids.length === 1 ? 'Task deleted.' : `${ids.length} tasks deleted.`)
  }

  function toggleTask(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((selected) => selected !== id) : [...current, id])
  }

  async function importFile(file: File | undefined) {
    if (!file) return
    setImportError('')
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportError('Choose a .csv file to import tasks.')
      return
    }

    setImporting(true)
    try {
      const text = await file.text()
      const imported = readCsvTaskDrafts(text).map((task) => ({ ...task, id: createTaskId() }))
      if (imported.length === 0) throw new Error('The CSV has a header but no task rows.')
      setTasks((current) => [...imported, ...current])
      setPage(1)
      setDialog(null)
      onNotify(`${imported.length} tasks imported.`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'The CSV could not be read.'
      setImportError(message)
    } finally {
      setImporting(false)
    }
  }

  function downloadTemplate() {
    const csv = 'title,status,priority,label\n"Review dashboard metrics",Todo,Medium,Feature\n'
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'northstar-tasks-template.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <section className="task-workspace">
      <div className="task-toolbar">
        <div className="task-filters">
          <label className="task-filter">
            <select aria-label="Filter tasks by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option>All statuses</option>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
            <ChevronDown size={14} />
          </label>
          <label className="task-filter">
            <select aria-label="Filter tasks by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
              <option>All priorities</option>
              {priorities.map((priority) => <option key={priority}>{priority}</option>)}
            </select>
            <ChevronDown size={14} />
          </label>
          <label className="task-filter">
            <select aria-label="Sort tasks" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option>Newest first</option>
              <option>Title A–Z</option>
              <option>Priority</option>
            </select>
            <ChevronDown size={14} />
          </label>
        </div>
        <div className="task-actions">
          <button className="task-secondary-button" onClick={() => { setImportError(''); setDialog('import') }}><ArrowDownToLine size={15} /> Import CSV</button>
          <button className="task-primary-button" onClick={openCreate}><Plus size={16} /> New task</button>
        </div>
      </div>

      <div className="task-list-card">
        <div className="task-list-heading">
          <div className="task-list-title"><span className="task-heading-icon"><ListTodo size={17} /></span><div><h2>All tasks</h2><p>{filteredTasks.length} tasks in this view</p></div></div>
          {selectedIds.length > 0 && <div className="task-selection-actions"><span>{selectedIds.length} selected</span><button className="task-delete-button" onClick={() => { setPendingDeleteIds(selectedIds); setDialog('delete') }}><Trash2 size={14} /> Delete selected</button></div>}
        </div>
        <div className="task-table-scroll">
          <table className="task-table">
            <thead><tr>
              <th><input aria-label="Select all visible tasks" type="checkbox" checked={allVisibleSelected} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...new Set([...current, ...visibleTasks.map((task) => task.id)])] : current.filter((id) => !visibleTasks.some((task) => task.id === id)))} /></th>
              <th>TASK</th><th>STATUS</th><th>PRIORITY</th><th>LABEL</th><th><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody>
              {visibleTasks.map((task) => <tr key={task.id}>
                <td><input aria-label={`Select ${task.title}`} type="checkbox" checked={selectedIds.includes(task.id)} onChange={() => toggleTask(task.id)} /></td>
                <td><div className="task-title-cell"><span>{task.id}</span><strong>{task.title}</strong></div></td>
                <td><span className={`task-status task-status-${task.status.toLowerCase().replace(' ', '-')}`}><i />{task.status}</span></td>
                <td><span className={`task-priority task-priority-${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                <td><span className={`task-label task-label-${task.label.toLowerCase()}`}>{task.label}</span></td>
                <td><div className="task-row-actions"><button aria-label={`Edit ${task.title}`} onClick={() => openEdit(task)}>Edit</button><button aria-label={`Duplicate ${task.title}`} onClick={() => { setTasks((current) => [{ ...task, id: createTaskId(), title: `${task.title} (copy)` }, ...current]); setPage(1); onNotify('Task duplicated.') }}><Copy size={14} /></button><button aria-label={`Delete ${task.title}`} onClick={() => { setPendingDeleteIds([task.id]); setDialog('delete') }}><Trash2 size={14} /></button></div></td>
              </tr>)}
              {visibleTasks.length === 0 && <tr><td colSpan={6}><div className="task-empty"><Search size={18} />{tasks.length === 0 ? <><span>No tasks yet. Create a task to get started.</span><button onClick={openCreate}>Create a task</button></> : <><span>No tasks match these filters.</span><button onClick={() => { onSearchChange(''); setStatusFilter('All statuses'); setPriorityFilter('All priorities') }}>Clear filters</button></>}</div></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="task-pagination"><span>Showing {filteredTasks.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredTasks.length)} of {filteredTasks.length}</span><div><button aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={16} /></button><span>Page {currentPage} of {pageCount}</span><button aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><ChevronRight size={16} /></button></div></div>
      </div>

      {dialog && <div className="task-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null) }}>
        {dialog === 'task' && <form className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-dialog-title" onSubmit={saveTask}>
          <button className="task-modal-close" type="button" aria-label="Close dialog" onClick={() => setDialog(null)}><X size={17} /></button>
          <div className="task-modal-icon"><ListTodo size={19} /></div><h2 id="task-dialog-title">{editingTask ? 'Edit task' : 'Create a task'}</h2><p>Add a title and choose the task details.</p>
          <label className="task-form-field">Title<input autoFocus required maxLength={120} aria-describedby={taskError ? 'task-title-error' : undefined} value={draft.title} onChange={(event) => { setDraft({ ...draft, title: event.target.value }); setTaskError('') }} placeholder="What needs to be done?" /></label>
          {taskError && <p id="task-title-error" className="task-import-error" role="alert">{taskError}</p>}
          <div className="task-form-grid">
            <label className="task-form-field">Status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as TaskStatus })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label className="task-form-field">Priority<select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as TaskPriority })}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
          </div>
          <label className="task-form-field">Label<select value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value as TaskLabel })}>{labels.map((label) => <option key={label}>{label}</option>)}</select></label>
          <div className="task-modal-actions"><button className="task-secondary-button" type="button" onClick={() => setDialog(null)}>Cancel</button><button className="task-primary-button" type="submit"><Check size={15} />{editingTask ? 'Save task' : 'Create task'}</button></div>
        </form>}

        {dialog === 'import' && <div className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-import-title">
          <button className="task-modal-close" type="button" aria-label="Close dialog" disabled={importing} onClick={() => setDialog(null)}><X size={17} /></button>
          <div className="task-modal-icon"><ArrowDownToLine size={19} /></div><h2 id="task-import-title">Import tasks</h2><p>Choose a CSV file. Required column: <code>title</code>. Optional: <code>status</code>, <code>priority</code>, <code>label</code>.</p>
          <label className="task-form-field">CSV file<input type="file" accept=".csv,text/csv" disabled={importing} onChange={(event) => { void importFile(event.currentTarget.files?.[0]); event.currentTarget.value = '' }} /></label>
          {importing && <p className="task-import-status" role="status">Reading CSV file…</p>}
          {importError && <p className="task-import-error" role="alert">{importError}</p>}
          <button className="task-template-button" type="button" disabled={importing} onClick={downloadTemplate}><ArrowDownToLine size={14} /> Download CSV template</button>
          <div className="task-modal-actions"><button className="task-secondary-button" type="button" disabled={importing} onClick={() => setDialog(null)}>Close</button></div>
        </div>}

        {dialog === 'delete' && <div className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-delete-title">
          <button className="task-modal-close" type="button" aria-label="Close dialog" onClick={() => setDialog(null)}><X size={17} /></button>
          <div className="task-modal-icon task-delete-icon"><Trash2 size={19} /></div><h2 id="task-delete-title">Delete {pendingDeleteIds.length === 1 ? 'task' : 'tasks'}?</h2><p>This will permanently remove {pendingDeleteIds.length} {pendingDeleteIds.length === 1 ? 'task' : 'tasks'} from this browser.</p>
          <div className="task-modal-actions"><button className="task-secondary-button" onClick={() => setDialog(null)}>Cancel</button><button className="task-danger-button" onClick={() => deleteTasks(pendingDeleteIds)}>Delete</button></div>
        </div>}
      </div>}
    </section>
  )
}
