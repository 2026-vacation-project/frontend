import { createContext, useContext } from 'react'
import type { GroupResponse, OAuthProvider, UserCreate, UserResponse } from '../types/api'

export interface ToastState {
    id: number
    message: string
    tone: 'success' | 'error' | 'info'
}

export interface AppContextValue {
    currentUser: UserResponse | null
    groups: GroupResponse[]
    activeGroup: GroupResponse | null
    activeGroupId: number | null
    loadingGroups: boolean
    backendError: string | null
    toast: ToastState | null
    login: (provider: OAuthProvider, data: UserCreate) => Promise<UserResponse>
    logout: () => void
    selectGroup: (groupId: number) => void
    refreshGroups: () => Promise<void>
    createGroup: (name: string) => Promise<GroupResponse>
    refreshCurrentUser: () => Promise<void>
    showToast: (message: string, tone?: ToastState['tone']) => void
    clearToast: () => void
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useApp() {
    const context = useContext(AppContext)
    if (!context) throw new Error('useApp must be used within AppProvider')
    return context
}
