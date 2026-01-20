import { useState } from 'react'
import { loadMemberId, loadMemberName, saveMemberInfo } from '../storage'

export const useAuth = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(loadMemberId())
  const [currentUserName, setCurrentUserName] = useState<string | null>(loadMemberName())

  const login = (id: string, name: string) => {
    setCurrentUserId(id)
    setCurrentUserName(name)
    saveMemberInfo(id, name)
  }

  const logout = () => {
    setCurrentUserId(null)
    setCurrentUserName(null)
    saveMemberInfo(null, null)
  }

  const updateName = (name: string) => {
    setCurrentUserName(name)
    if (currentUserId) {
      saveMemberInfo(currentUserId, name)
    }
  }

  return {
    currentUserId,
    currentUserName,
    setCurrentUserName,
    login,
    logout,
    updateName,
  }
}

