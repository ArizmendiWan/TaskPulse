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

describe('Authentication', () => {
  it('allows a user to log in and see their projects', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Alex' },
    })
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'alex@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Login/i }))

    expect(await screen.findByRole('heading', { name: /Alex's Projects/i })).toBeInTheDocument()
  }, 10000)

  it('allows a user to log out', async () => {
    render(<App />)

    // Login
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Alex' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'alex@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /Login/i }))

    // Wait for overview page
    await screen.findByRole('heading', { name: /Alex's Projects/i })

    // Logout
    const logoutBtn = screen.getByRole('button', { name: /Logout/i })
    fireEvent.click(logoutBtn)

    // Should see login screen again
    expect(await screen.findByRole('button', { name: /Login/i })).toBeInTheDocument()
  }, 10000)
})
