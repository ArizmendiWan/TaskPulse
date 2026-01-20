import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  window.history.replaceState({}, '', '/')
  localStorage.clear()
  vi.stubGlobal('crypto', {
    randomUUID: () => 'uuid-' + Math.random().toString(16).slice(2),
  } as Crypto)
  vi.stubGlobal('confirm', vi.fn(() => true))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

async function loginAndCreateProject() {
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

describe('Member Management', () => {
  it('identifies the project owner in the teammates list', async () => {
    render(<App />)
    await loginAndCreateProject()

    // Alex should be identified as the Project Owner
    expect(await screen.findByText('Project Owner')).toBeInTheDocument()
    
    // Alex should not have a remove button for themselves
    const alexMemberCard = screen.getByText(/Alex/i).closest('.group\\/member')
    if (alexMemberCard) {
      const removeBtn = within(alexMemberCard as HTMLElement).queryByTitle('Remove from project')
      expect(removeBtn).not.toBeInTheDocument()
    }
  })
})
