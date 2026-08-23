import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { groupsApi } from '../api/groups';
import { usersApi } from '../api/users';
import {
    authSessionChangedEvent,
    clearAuthSession,
    readAuthSession,
    saveAuthSession,
    updateAuthUser,
} from '../auth/session';
import type { GroupResponse, OAuthProvider, UserResponse } from '../types/api';
import {
    getNotificationPreference,
    listenToPushNotifications,
    setNotificationPreference,
    unregisterFromPushNotifications,
} from '../notifications/push';
import { startRoomRealtime, stopRoomRealtime } from '../realtime/rooms';
import { getErrorMessage, userDisplayName } from '../utils/format';
import { AppContext, type AppContextValue, type ToastState } from './useApp';
const groupKey = 'teammoa-active-group';

function readStoredUser(): UserResponse | null {
    return readAuthSession()?.user ?? null;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(readStoredUser);
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(() => {
        const stored = sessionStorage.getItem(groupKey)?.trim();
        return stored || null;
    });
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [toast, setToast] = useState<ToastState | null>(null);

    const showToast = useCallback((message: string, tone: ToastState['tone'] = 'info') => {
        setToast({ id: Date.now(), message, tone });
    }, []);

    const clearToast = useCallback(() => setToast(null), []);

    useEffect(() => {
        const syncSession = () => setCurrentUser(readStoredUser());
        window.addEventListener(authSessionChangedEvent, syncSession);
        return () => window.removeEventListener(authSessionChangedEvent, syncSession);
    }, []);

    useEffect(() => {
        const accessToken = readAuthSession()?.accessToken;
        if (!currentUser?.id || !accessToken) {
            stopRoomRealtime();
            return;
        }
        return startRoomRealtime(accessToken);
    }, [currentUser?.id]);

    useEffect(() => {
        const userId = currentUser?.id;
        if (
            !userId ||
            !('Notification' in window) ||
            Notification.permission !== 'granted' ||
            !currentUser.fcm_token ||
            getNotificationPreference(userId) !== 'on'
        ) {
            return;
        }

        let active = true;
        let stopListening: (() => void) | undefined;
        const updateStoredTarget = (installationId: string | null) => {
            setCurrentUser((user) => {
                if (!user || user.id !== userId || user.fcm_token === installationId) return user;
                const updated = { ...user, fcm_token: installationId };
                updateAuthUser(updated);
                return updated;
            });
        };

        void listenToPushNotifications({
            onTargetRegistered: (installationId) => {
                if (!active || currentUser?.fcm_token === installationId) return;
                void usersApi
                    .updateFcmToken(userId, installationId)
                    .then(() => {
                        if (active) updateStoredTarget(installationId);
                    })
                    .catch(() => undefined);
            },
            onTargetUnregistered: (installationId) => {
                if (!active || currentUser?.fcm_token !== installationId) return;
                setNotificationPreference(userId, false);
                void usersApi
                    .updateFcmToken(userId, '')
                    .then(() => {
                        if (active) updateStoredTarget(null);
                    })
                    .catch(() => undefined);
            },
            onMessageReceived: (payload) => {
                const message = payload.notification?.body ?? payload.notification?.title ?? '새 알림이 도착했어요.';
                showToast(message, 'info');
            },
        })
            .then((stop) => {
                if (active) stopListening = stop;
                else stop();
            })
            .catch(() => undefined);

        return () => {
            active = false;
            stopListening?.();
        };
    }, [currentUser?.fcm_token, currentUser?.id, showToast]);

    const refreshGroups = useCallback(async () => {
        if (!currentUser) {
            setGroups([]);
            setActiveGroupId(null);
            setLoadingGroups(false);
            return;
        }
        setLoadingGroups(true);
        try {
            const nextGroups = await groupsApi.list();
            setGroups(nextGroups);
            setActiveGroupId((current) => {
                if (current && nextGroups.some((group) => group.id === current)) return current;
                const joined = nextGroups.find((group) =>
                    (group.members ?? []).some((member) => member.id === currentUser.id),
                );
                return joined?.id ?? nextGroups[0]?.id ?? null;
            });
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setLoadingGroups(false);
        }
    }, [currentUser, showToast]);

    useEffect(() => {
        const timer = window.setTimeout(() => void refreshGroups(), 0);
        return () => window.clearTimeout(timer);
    }, [refreshGroups]);

    useEffect(() => {
        if (activeGroupId) sessionStorage.setItem(groupKey, String(activeGroupId));
        else sessionStorage.removeItem(groupKey);
    }, [activeGroupId]);

    async function login(provider: OAuthProvider, code: string) {
        const response = await authApi.login(provider, code);
        saveAuthSession(response);
        setCurrentUser(response.user);
        showToast(`${userDisplayName(response.user)}님, 반가워요.`, 'success');
        return response.user;
    }

    async function logout() {
        if (currentUser) {
            await Promise.allSettled([usersApi.updateFcmToken(currentUser.id, ''), unregisterFromPushNotifications()]);
            setNotificationPreference(currentUser.id, false);
        }
        clearAuthSession();
        setCurrentUser(null);
        setGroups([]);
        setActiveGroupId(null);
        showToast('이 기기에서 로그아웃했어요.', 'info');
    }

    async function logoutAll() {
        const result = await authApi.logoutAll();
        await unregisterFromPushNotifications().catch(() => undefined);
        if (currentUser) setNotificationPreference(currentUser.id, false);
        clearAuthSession();
        setCurrentUser(null);
        setGroups([]);
        setActiveGroupId(null);
        const roomMessage = result.left_room_count
            ? ` 참가 중이던 모집방 ${result.left_room_count}개에서도 나왔어요.`
            : '';
        showToast(`모든 기기에서 로그아웃했어요.${roomMessage}`, 'info');
        return result;
    }

    const selectGroup = useCallback((groupId: string) => {
        setActiveGroupId(groupId);
    }, []);

    async function createGroup(name: string, isPublic: boolean) {
        const created = await groupsApi.create({ name, is_public: isPublic });
        if (currentUser) await groupsApi.join(created.id, currentUser.id);
        await refreshGroups();
        setActiveGroupId(created.id);
        showToast(`${created.name} 그룹을 만들었어요.`, 'success');
        return created;
    }

    async function refreshCurrentUser() {
        if (!currentUser) return;
        const user = await usersApi.get(currentUser.id);
        setCurrentUser(user);
        updateAuthUser(user);
    }

    const activeGroup = groups.find((group) => group.id === activeGroupId) ?? null;
    const value: AppContextValue = {
        currentUser,
        groups,
        activeGroup,
        activeGroupId,
        loadingGroups,
        toast,
        login,
        logout,
        logoutAll,
        selectGroup,
        refreshGroups,
        createGroup,
        refreshCurrentUser,
        showToast,
        clearToast,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
