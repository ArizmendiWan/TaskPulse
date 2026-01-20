import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  // vi.useFakeTimers() // Removed to allow real async operations in tests
  localStorage.clear()
  vi.stubGlobal('crypto', {
    randomUUID: () => 'uuid-' + Math.random().toString(16).slice(2),
  } as Crypto)
})

afterEach(() => {
  vi.unstubAllGlobals()
  // vi.useRealTimers()
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
    // Set due date to 24 hours from now to ensure it is "At Risk"
    const tomorrow = new Date()
    tomorrow.setHours(tomorrow.getHours() + 24)
    const dueString = tomorrow.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm

    fireEvent.change(screen.getByLabelText(/Due date/i), {
      target: { value: dueString },
    })
    const modal = await screen.findByRole('dialog', { name: /New task/i })
    fireEvent.click(within(modal).getByRole('button', { name: /CREATE TASK/i }))

    // Filter by "AT RISK"
    const filterContainer = screen.getByRole('group', { name: /task filters/i })
    fireEvent.click(within(filterContainer).getByRole('button', { name: /AT RISK/i }))
    
    const taskTitle = await screen.findByText('Write report')
    const taskCard = taskTitle.closest('.group') as HTMLElement
    expect(taskCard).toBeTruthy()

    // Expand the card (which is now a div with role="button")
    fireEvent.click(within(taskCard).getByRole('button', { name: /Write report/i }))

    const statusSelect = await within(taskCard).findByRole('combobox', { name: /status/i })
    fireEvent.change(statusSelect, { target: { value: 'in_progress' } })

    fireEvent.click(within(filterContainer).getByRole('button', { name: /AT RISK/i }))
    expect(await screen.findByText(/No tasks found/i)).toBeInTheDocument()

    fireEvent.click(within(filterContainer).getByRole('button', { name: /DUE SOON/i }))
    expect(await screen.findByText('Write report')).toBeInTheDocument()
  }, 15000)
})
