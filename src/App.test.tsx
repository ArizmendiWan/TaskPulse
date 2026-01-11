import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
  localStorage.clear()
  vi.stubGlobal('crypto', {
    randomUUID: () => 'uuid-' + Math.random().toString(16).slice(2),
  } as Crypto)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('TaskPulse MVP flow', () => {
  it('creates a task and moves it out of the at-risk filter when started', () => {
    window.history.pushState({}, '', '/new')
    render(<App />)

    fireEvent.change(screen.getByLabelText(/Project name/i), {
      target: { value: 'Demo Project' },
    })
    fireEvent.click(screen.getByText(/Create project/i))

    fireEvent.change(screen.getByLabelText(/Your name/i), {
      target: { value: 'Alex' },
    })
    fireEvent.click(screen.getByText(/Save my name/i))

    fireEvent.click(screen.getAllByRole('button', { name: /Add task/i })[0])

    fireEvent.change(screen.getByLabelText(/^Title/i), {
      target: { value: 'Write report' },
    })
    fireEvent.change(screen.getByLabelText(/Due date\/time/i), {
      target: { value: '2025-01-01T12:00' },
    })
    const modal = screen.getByRole('dialog', { name: /New task/i })
    fireEvent.click(within(modal).getByRole('button', { name: /Add task/i }))

    fireEvent.click(screen.getAllByRole('button', { name: /At Risk/i })[0])
    const taskCard = screen.getByText('Write report').closest('div') as HTMLElement
    expect(taskCard).toBeTruthy()

    const selects = within(taskCard).getAllByRole('combobox')
    const statusSelect = selects[1]
    fireEvent.change(statusSelect, { target: { value: 'in_progress' } })

    fireEvent.click(screen.getAllByRole('button', { name: /At Risk/i })[0])
    expect(screen.getByText(/No tasks in this view/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText(/Due Soon/))
    expect(screen.getByText('Write report')).toBeInTheDocument()
  })
})

