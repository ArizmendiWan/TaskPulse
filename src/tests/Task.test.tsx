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

    fireEvent.click(await screen.findByRole('button', { name: /POST TASK/i }))
    fireEvent.change(await screen.findByPlaceholderText(/e\.g\. Write report introduction/i), {
      target: { value: 'Test Task' },
    })
    
    const tomorrow = new Date()
    tomorrow.setHours(tomorrow.getHours() + 24)
    const dueString = tomorrow.toISOString().slice(0, 16)
    fireEvent.change(screen.getByLabelText(/Due date/i), { target: { value: dueString } })

    const modal = await screen.findByRole('dialog', { name: /New task/i })
    fireEvent.click(within(modal).getByRole('button', { name: /POST TASK/i }))

    expect(await screen.findByText('Test Task')).toBeInTheDocument()
  }, 10000)

  it('filters tasks by DUE SOON status', async () => {
    render(<App />)
    await setupProject()

    // Add a task due soon (within 48h)
    fireEvent.click(await screen.findByRole('button', { name: /POST TASK/i }))
    fireEvent.change(await screen.findByPlaceholderText(/e\.g\. Write report introduction/i), {
      target: { value: 'Due Soon Task' },
    })
    const tomorrow = new Date()
    tomorrow.setHours(tomorrow.getHours() + 24)
    fireEvent.change(screen.getByLabelText(/Due date/i), { target: { value: tomorrow.toISOString().slice(0, 16) } })
    const modal = await screen.findByRole('dialog', { name: /New task/i })
    fireEvent.click(within(modal).getByRole('button', { name: /POST TASK/i }))

    // Click the Due Soon filter
    const filterContainer = await screen.findByRole('group', { name: /task filters/i })
    fireEvent.click(within(filterContainer).getByRole('button', { name: /DUE SOON/i }))

    expect(await screen.findByText('Due Soon Task')).toBeInTheDocument()
  }, 10000)

  it('claiming a task changes its status to in progress', async () => {
    render(<App />)
    await setupProject()

    // Add a task
    fireEvent.click(await screen.findByRole('button', { name: /POST TASK/i }))
    fireEvent.change(await screen.findByPlaceholderText(/e\.g\. Write report introduction/i), { target: { value: 'Claim Me' } })
    const tomorrow = new Date()
    tomorrow.setHours(tomorrow.getHours() + 24)
    fireEvent.change(screen.getByLabelText(/Due date/i), { target: { value: tomorrow.toISOString().slice(0, 16) } })
    const modal = await screen.findByRole('dialog', { name: /New task/i })
    fireEvent.click(within(modal).getByRole('button', { name: /POST TASK/i }))

    // Find the task and click the Claim button
    const taskTitle = await screen.findByText('Claim Me')
    const taskCard = taskTitle.closest('.group') as HTMLElement
    const claimButton = await within(taskCard).findByRole('button', { name: /^Claim$/i })
    fireEvent.click(claimButton)

    // After claiming, should show IN PROGRESS status and Leave button
    expect(await within(taskCard).findByText(/IN PROGRESS/i)).toBeInTheDocument()
    expect(await within(taskCard).findByRole('button', { name: /Leave/i })).toBeInTheDocument()
  }, 10000)
})
