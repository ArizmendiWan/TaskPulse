import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

beforeEach(() => {
  window.history.replaceState({}, '', '/')
  localStorage.clear()
  vi.stubGlobal('crypto', {
    randomUUID: () => 'uuid-' + Math.random().toString(16).slice(2),
  } as Crypto)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

async function setupProject() {
  fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Alex' } })
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'alex@example.com' } })
  fireEvent.click(screen.getByRole('button', { name: /Login/i }))
  
  // Wait for overview
  await screen.findByRole('heading', { name: /Alex's Projects/i })

  fireEvent.click(await screen.findByRole('button', { name: /NEW PROJECT/i }))
  fireEvent.change(await screen.findByLabelText(/Project name/i), { target: { value: 'Demo Project' } })
  fireEvent.click(screen.getByRole('button', { name: /Create Project & Get Link/i }))
  
  // Wait for dashboard
  await screen.findByRole('heading', { name: 'Demo Project', level: 1 })
}

describe('Task Management', () => {
  it('creates a new task', async () => {
    render(<App />)
    await setupProject()

    fireEvent.click(await screen.findByRole('button', { name: /ADD TASK/i }))
    fireEvent.change(await screen.findByPlaceholderText(/e\.g\. Write report introduction/i), {
      target: { value: 'Test Task' },
    })
    
    const tomorrow = new Date()
    tomorrow.setHours(tomorrow.getHours() + 24)
    const dueString = tomorrow.toISOString().slice(0, 16)
    fireEvent.change(screen.getByLabelText(/Due date/i), { target: { value: dueString } })

    const modal = await screen.findByRole('dialog', { name: /New task/i })
    fireEvent.click(within(modal).getByRole('button', { name: /CREATE TASK/i }))

    expect(await screen.findByText('Test Task')).toBeInTheDocument()
  }, 10000)

  it('filters tasks by AT RISK status', async () => {
    render(<App />)
    await setupProject()

    // Add an At Risk task (due in 24h, not started)
    fireEvent.click(await screen.findByRole('button', { name: /ADD TASK/i }))
    fireEvent.change(await screen.findByPlaceholderText(/e\.g\. Write report introduction/i), {
      target: { value: 'At Risk Task' },
    })
    const tomorrow = new Date()
    tomorrow.setHours(tomorrow.getHours() + 24)
    fireEvent.change(screen.getByLabelText(/Due date/i), { target: { value: tomorrow.toISOString().slice(0, 16) } })
    const modal = await screen.findByRole('dialog', { name: /New task/i })
    fireEvent.click(within(modal).getByRole('button', { name: /CREATE TASK/i }))

    // Need to make sure the filter container exists before clicking
    const filterContainer = await screen.findByRole('group', { name: /task filters/i })
    fireEvent.click(within(filterContainer).getByRole('button', { name: /AT RISK/i }))

    expect(await screen.findByText('At Risk Task')).toBeInTheDocument()
  }, 10000)

  it('moves task out of AT RISK when started', async () => {
    render(<App />)
    await setupProject()

    // Add At Risk task
    fireEvent.click(await screen.findByRole('button', { name: /ADD TASK/i }))
    fireEvent.change(await screen.findByPlaceholderText(/e\.g\. Write report introduction/i), { target: { value: 'Move Me' } })
    const tomorrow = new Date()
    tomorrow.setHours(tomorrow.getHours() + 24)
    fireEvent.change(screen.getByLabelText(/Due date/i), { target: { value: tomorrow.toISOString().slice(0, 16) } })
    const modal = await screen.findByRole('dialog', { name: /New task/i })
    fireEvent.click(within(modal).getByRole('button', { name: /CREATE TASK/i }))

    // Expand and change status
    const taskTitle = await screen.findByText('Move Me')
    const taskCard = taskTitle.closest('.group') as HTMLElement
    fireEvent.click(within(taskCard).getByRole('button', { name: /Move Me/i }))

    // Enter Edit mode
    const editButton = await within(taskCard).findByRole('button', { name: /Edit Task/i })
    fireEvent.click(editButton)

    const statusSelect = await within(taskCard).findByRole('combobox', { name: /status/i })
    fireEvent.change(statusSelect, { target: { value: 'in_progress' } })

    // Finish Edit mode
    const doneButton = await within(taskCard).findByRole('button', { name: /Done Editing/i })
    fireEvent.click(doneButton)

    // Check filter
    const filterContainer = await screen.findByRole('group', { name: /task filters/i })
    fireEvent.click(within(filterContainer).getByRole('button', { name: /AT RISK/i }))
    expect(await screen.findByText(/No tasks found/i)).toBeInTheDocument()
  }, 10000)
})
