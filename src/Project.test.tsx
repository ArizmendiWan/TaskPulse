import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

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

async function logIn() {
  fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Alex' } })
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'alex@example.com' } })
  fireEvent.click(screen.getByRole('button', { name: /Login/i }))
  // Wait for the overview page to load
  await screen.findByRole('heading', { name: /Alex's Projects/i })
}

describe('Project Management', () => {
  it('allows a user to create a new project', async () => {
    render(<App />)
    await logIn()

    fireEvent.click(await screen.findByRole('button', { name: /NEW PROJECT/i }))

    fireEvent.change(await screen.findByLabelText(/Project name/i), {
      target: { value: 'Demo Project' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Create Project & Get Link/i }))

    // Check for the project title in the header specifically to avoid duplicates
    expect(await screen.findByRole('heading', { name: 'Demo Project', level: 1 })).toBeInTheDocument()
  }, 10000)

  it('allows navigating back to overview from a project dashboard', async () => {
    render(<App />)
    await logIn()

    // Create project
    fireEvent.click(await screen.findByRole('button', { name: /NEW PROJECT/i }))
    fireEvent.change(await screen.findByLabelText(/Project name/i), {
      target: { value: 'Demo Project' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Create Project & Get Link/i }))

    // Wait for dashboard
    await screen.findByRole('heading', { name: 'Demo Project', level: 1 })

    // Now in dashboard, click "Back to Overview"
    const backBtn = await screen.findByRole('button', { name: /BACK TO PROJECTS/i })
    fireEvent.click(backBtn)

    expect(await screen.findByRole('heading', { name: /Alex's Projects/i })).toBeInTheDocument()
  }, 10000)
})
