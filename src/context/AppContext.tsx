import { useCallback, useEffect, useState } from 'react'
import { authApi } from '../api/auth'
import { groupsApi } from '../api/groups'
import { usersApi } from '../api/users'
import type { GroupResponse, OAuthProvider, UserCreate, UserResponse } from '../types/api'
import { getErrorMessage } from '../utils/format'
import { AppContext, type AppContextValue, type ToastState } from './useApp'
const sessionKey = 'teammoa-current-user'
const groupKey = 'teammoa-active-group'

function readStoredUser(): UserResponse | null {
    try {
        const value = sessionStorage.getItem(sessionKey)
        return value ? (JSON.parse(value) as UserResponse) : null
    } catch {
        return null
    }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(readStoredUser)
    const [groups, setGroups] = useState<GroupResponse[]>([])
    const [activeGroupId, setActiveGroupId] = useState<number | null>(() => {
        const stored = Number(sessionStorage.getItem(groupKey))
        return Number.isFinite(stored) && stored > 0 ? stored : null
    })
    const [loadingGroups, setLoadingGroups] = useState(true)
    const [backendError, setBackendError] = useState<string | null>(null)
    const [toast, setToast] = useState<ToastState | null>(null)

    const showToast = useCallback((message: string, tone: ToastState['tone'] = 'info') => {
        setToast({ id: Date.now(), message, tone })
    }, [])

    const clearToast = useCallback(() => setToast(null), [])

    const refreshGroups = useCallback(async () => {
        if (!currentUser) {
            setGroups([])
            setActiveGroupId(null)
            setLoadingGroups(false)
            return
        }
        setLoadingGroups(true)
        try {
            const nextGroups = await groupsApi.list()
            setGroups(nextGroups)
            setBackendError(null)
            setActiveGroupId((current) => {
                if (current && nextGroups.some((group) => group.id === current)) return current
                const joined = nextGroups.find((group) =>
                    (group.members ?? []).some((member) => member.id === currentUser.id),
                )
                return joined?.id ?? nextGroups[0]?.id ?? null
            })
        } catch (error) {
            setBackendError(getErrorMessage(error))
        } finally {
            setLoadingGroups(false)
        }
    }, [currentUser])

    useEffect(() => {
        const timer = window.setTimeout(() => void refreshGroups(), 0)
        return () => window.clearTimeout(timer)
    }, [refreshGroups])

    useEffect(() => {
        if (activeGroupId) sessionStorage.setItem(groupKey, String(activeGroupId))
        else sessionStorage.removeItem(groupKey)
    }, [activeGroupId])

    async function login(provider: OAuthProvider, data: UserCreate) {
        const user = await authApi.login(provider, data)
        setCurrentUser(user)
        sessionStorage.setItem(sessionKey, JSON.stringify(user))
        showToast(`${user.name}님, 반가워요.`, 'success')
        return user
    }

    function logout() {
        setCurrentUser(null)
        sessionStorage.removeItem(sessionKey)
        showToast('로그아웃했어요.', 'info')
    }

    const selectGroup = useCallback((groupId: number) => {
        setActiveGroupId(groupId)
    }, [])

    async function createGroup(name: string) {
        const created = await groupsApi.create({ name })
        if (currentUser) await groupsApi.join(created.id, currentUser.id)
        await refreshGroups()
        setActiveGroupId(created.id)
        showToast(`${created.name} 그룹을 만들었어요.`, 'success')
        return created
    }

    async function refreshCurrentUser() {
        if (!currentUser) return
        const user = await usersApi.get(currentUser.id)
        setCurrentUser(user)
        sessionStorage.setItem(sessionKey, JSON.stringify(user))
    }

    const activeGroup = groups.find((group) => group.id === activeGroupId) ?? null
    const value: AppContextValue = {
        currentUser,
        groups,
        activeGroup,
        activeGroupId,
        loadingGroups,
        backendError,
        toast,
        login,
        logout,
        selectGroup,
        refreshGroups,
        createGroup,
        refreshCurrentUser,
        showToast,
        clearToast,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
