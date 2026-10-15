export type TaskStatus = 'Todo' | 'In progress' | 'Backlog' | 'Done' | 'Canceled'
export type TaskPriority = 'High' | 'Medium' | 'Low'
export type TaskLabel = 'Feature' | 'Bug' | 'Documentation'

export type TaskDraft = {
  title: string
  status: TaskStatus
  priority: TaskPriority
  label: TaskLabel
}

export const taskStatuses: TaskStatus[] = ['Todo', 'In progress', 'Backlog', 'Done', 'Canceled']
export const taskPriorities: TaskPriority[] = ['High', 'Medium', 'Low']
export const taskLabels: TaskLabel[] = ['Feature', 'Bug', 'Documentation']

function parseCsv(text: string): string[][] {
  const records: string[][] = []
  let record: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      record.push(field)
      field = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1
      record.push(field)
      if (record.some((value) => value.trim())) records.push(record)
      record = []
      field = ''
    } else {
      field += char
    }
  }

  if (quoted) throw new Error('The CSV contains an unclosed quoted field.')
  record.push(field)
  if (record.some((value) => value.trim())) records.push(record)
  return records
}

export function readCsvTaskDrafts(text: string): TaskDraft[] {
  const records = parseCsv(text.replace(/^\uFEFF/, ''))
  const header = records.shift()?.map((value) => value.trim().toLowerCase())
  if (!header?.includes('title')) {
    throw new Error('The CSV must have a "title" column.')
  }

  const column = (name: string) => header.indexOf(name)
  return records.map((record, index) => {
    const lineNumber = index + 2
    const title = (record[column('title')] ?? '').trim()
    const rawStatus = (record[column('status')] ?? 'Todo').trim()
    const rawPriority = (record[column('priority')] ?? 'Medium').trim()
    const rawLabel = (record[column('label')] ?? 'Feature').trim()
    const status = taskStatuses.find((value) => value.toLowerCase() === rawStatus.toLowerCase())
    const priority = taskPriorities.find((value) => value.toLowerCase() === rawPriority.toLowerCase())
    const label = taskLabels.find((value) => value.toLowerCase() === rawLabel.toLowerCase())

    if (!title) throw new Error(`Row ${lineNumber}: title is required.`)
    if (!status) throw new Error(`Row ${lineNumber}: unknown status "${rawStatus}".`)
    if (!priority) throw new Error(`Row ${lineNumber}: unknown priority "${rawPriority}".`)
    if (!label) throw new Error(`Row ${lineNumber}: unknown label "${rawLabel}".`)

    return { title, status, priority, label }
  })
}
