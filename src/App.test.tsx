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
  it('creates a task and moves it out of the at-risk filter when started', async () => {
    render(<App />)

    // Log in first
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Alex' },
    })
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'alex@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Login/i }))

    // Now navigate to create project
    fireEvent.click(await screen.findByRole('button', { name: /NEW PROJECT/i }))

    fireEvent.change(await screen.findByLabelText(/Project name/i), {
      target: { value: 'Demo Project' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Create Project & Get Link/i }))

    // Now on project page, add task
    fireEvent.click(await screen.findByRole('button', { name: /ADD TASK/i }))

    fireEvent.change(await screen.findByPlaceholderText(/e\.g\. Write report introduction/i), {
      target: { value: 'Write report' },
    })
    fireEvent.change(screen.getByLabelText(/Due date/i), {
      target: { value: '2025-01-01T12:00' },
    })
    const modal = await screen.findByRole('dialog', { name: /New task/i })
    fireEvent.click(within(modal).getByRole('button', { name: /CREATE TASK/i }))

    fireEvent.click(await screen.findByRole('button', { name: /AT RISK/i }))
    const taskTitle = await screen.findByText('Write report')
    const taskCard = taskTitle.closest('.group') as HTMLElement
    expect(taskCard).toBeTruthy()

    // Expand the card
    fireEvent.click(taskCard.querySelector('button')!)

    const statusSelect = await within(taskCard).findByRole('combobox', { name: /status/i })
    fireEvent.change(statusSelect, { target: { value: 'in_progress' } })

    fireEvent.click(await screen.findByRole('button', { name: /AT RISK/i }))
    expect(await screen.findByText(/No tasks found/i)).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: /DUE SOON/i }))
    expect(await screen.findByText('Write report')).toBeInTheDocument()
  })
})

