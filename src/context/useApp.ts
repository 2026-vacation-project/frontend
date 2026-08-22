import { createContext, useContext } from 'react';
import type { GroupResponse, LogoutAllResponse, OAuthProvider, UserResponse } from '../types/api';

export interface ToastState {
    id: number;
    message: string;
    tone: 'success' | 'error' | 'info';
}

export interface AppContextValue {
    currentUser: UserResponse | null;
    groups: GroupResponse[];
    activeGroup: GroupResponse | null;
    activeGroupId: string | null;
    loadingGroups: boolean;
    toast: ToastState | null;
    login: (provider: OAuthProvider, code: string) => Promise<UserResponse>;
    logout: () => Promise<void>;
    logoutAll: () => Promise<LogoutAllResponse>;
    selectGroup: (groupId: string) => void;
    refreshGroups: () => Promise<void>;
    createGroup: (name: string, isPublic: boolean) => Promise<GroupResponse>;
    refreshCurrentUser: () => Promise<void>;
    showToast: (message: string, tone?: ToastState['tone']) => void;
    clearToast: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}
