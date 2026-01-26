import { fireEvent, render, screen } from '@testing-library/react'
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

describe('Authentication', () => {
  it('allows a user to log in and see their projects', async () => {
    render(<App />)
    const testId = Math.random().toString(16).slice(2, 8)
    const name = `Alex-${testId}`
    const email = `alex-${testId}@example.com`

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: name },
    })
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: email },
    })
    fireEvent.click(screen.getByRole('button', { name: /Login/i }))

    expect(await screen.findByRole('heading', { name: new RegExp(`${name}'s Projects`, 'i') })).toBeInTheDocument()
  }, 15000)

  it('allows a user to log out', async () => {
    render(<App />)
    const testId = Math.random().toString(16).slice(2, 8)
    const name = `Alex-${testId}`
    const email = `alex-${testId}@example.com`

    // Login
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: name } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: email } })
    fireEvent.click(screen.getByRole('button', { name: /Login/i }))

    // Wait for overview page
    await screen.findByRole('heading', { name: new RegExp(`${name}'s Projects`, 'i') })

    // Logout
    const logoutBtn = screen.getByRole('button', { name: /Logout/i })
    fireEvent.click(logoutBtn)

    // Should see login screen again
    expect(await screen.findByRole('button', { name: /Login/i })).toBeInTheDocument()
  }, 10000)
})
