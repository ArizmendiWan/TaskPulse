import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

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
  const testId = Math.random().toString(16).slice(2, 8)
  const name = `Alex-${testId}`
  const email = `alex-${testId}@example.com`

  fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: name } })
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: email } })
  fireEvent.click(screen.getByRole('button', { name: /Login/i }))
  
  // Wait for overview
  await screen.findByRole('heading', { name: new RegExp(`${name}'s Projects`, 'i') })

  fireEvent.click(await screen.findByRole('button', { name: /NEW PROJECT/i }))
  fireEvent.change(await screen.findByLabelText(/Project name/i), { target: { value: 'Demo Project' } })
  fireEvent.click(screen.getByRole('button', { name: /Create Project & Get Link/i }))
  
  // Wait for dashboard
  await screen.findByRole('heading', { name: 'Demo Project', level: 1 })
  return name
}

describe('Member Management', () => {
  it('identifies the project owner in the teammates list', async () => {
    render(<App />)
    const name = await loginAndCreateProject()

    // Alex should be identified as the Project Owner
    expect(await screen.findByText('Project Owner')).toBeInTheDocument()
    
    // Target the teammates list specifically
    const teammatesSection = screen.getByText(/Teammates/i).closest('.space-y-4') as HTMLElement
    const alexMemberCard = within(teammatesSection).getByText(new RegExp(name, 'i')).closest('div')
    
    if (alexMemberCard) {
      const removeBtn = within(alexMemberCard as HTMLElement).queryByTitle('Remove from project')
      expect(removeBtn).not.toBeInTheDocument()
    }
  })
})
