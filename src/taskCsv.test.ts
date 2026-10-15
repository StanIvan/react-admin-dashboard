import { describe, expect, it } from 'vitest'
import { readCsvTaskDrafts } from './taskCsv'

describe('readCsvTaskDrafts', () => {
  it('reads reordered columns, a BOM, and case-insensitive task values', () => {
    const tasks = readCsvTaskDrafts('\uFEFFlabel,title,priority,status\r\nbug,Fix search,high,in progress')

    expect(tasks).toEqual([
      { title: 'Fix search', status: 'In progress', priority: 'High', label: 'Bug' },
    ])
  })

  it('preserves commas and escaped quotes inside quoted fields', () => {
    const tasks = readCsvTaskDrafts('title\n"Fix ""search"", filters"')

    expect(tasks[0].title).toBe('Fix "search", filters')
  })

  it('applies defaults for optional columns', () => {
    const tasks = readCsvTaskDrafts('title\nReview the dashboard')

    expect(tasks[0]).toEqual({
      title: 'Review the dashboard',
      status: 'Todo',
      priority: 'Medium',
      label: 'Feature',
    })
  })

  it('reports missing title columns and invalid task fields', () => {
    expect(() => readCsvTaskDrafts('name\nA task')).toThrow('The CSV must have a "title" column.')
    expect(() => readCsvTaskDrafts('title,status\n,Todo')).toThrow('Row 2: title is required.')
    expect(() => readCsvTaskDrafts('title,status\nA task,Unknown')).toThrow('Row 2: unknown status "Unknown".')
  })

  it('rejects unclosed quoted fields', () => {
    expect(() => readCsvTaskDrafts('title\n"unfinished')).toThrow('The CSV contains an unclosed quoted field.')
  })
})
