import { getApp, getApps, initializeApp } from 'firebase/app';
import {
    getMessaging,
    isSupported,
    onMessage,
    onRegistered,
    onUnregistered,
    register,
    unregister,
    type MessagePayload,
    type Messaging,
} from 'firebase/messaging';

export const notificationPreferenceKey = 'teammoa-notifications';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() ?? '',
};
const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim() ?? '';

interface MessagingContext {
    messaging: Messaging;
    serviceWorkerRegistration: ServiceWorkerRegistration;
}

interface PushListeners {
    onTargetRegistered: (installationId: string) => void;
    onTargetUnregistered: (installationId: string) => void;
    onMessageReceived: (payload: MessagePayload) => void;
}

let messagingContextPromise: Promise<MessagingContext> | null = null;

function userStorageKey(userId: string) {
    return `${notificationPreferenceKey}:${userId}`;
}

export function getNotificationPreference(userId: string) {
    return localStorage.getItem(userStorageKey(userId));
}

export function setNotificationPreference(userId: string, enabled: boolean) {
    localStorage.setItem(userStorageKey(userId), enabled ? 'on' : 'off');
}

export function isFirebasePushConfigured() {
    return Boolean(
        firebaseConfig.apiKey &&
        firebaseConfig.projectId &&
        firebaseConfig.messagingSenderId &&
        firebaseConfig.appId &&
        vapidKey,
    );
}

function serviceWorkerUrl() {
    const params = new URLSearchParams();
    Object.entries(firebaseConfig).forEach(([key, value]) => {
        if (value) params.set(key, value);
    });
    return `/firebase-messaging-sw.js?${params.toString()}`;
}

async function createMessagingContext(): Promise<MessagingContext> {
    if (!isFirebasePushConfigured()) {
        throw new Error('알림 설정이 아직 준비되지 않았어요. 관리자에게 문의해 주세요.');
    }
    if (!window.isSecureContext || !('serviceWorker' in navigator) || !(await isSupported())) {
        throw new Error('이 기기에서는 알림을 받을 수 없어요.');
    }

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const serviceWorkerRegistration = await navigator.serviceWorker.register(serviceWorkerUrl());
    return {
        messaging: getMessaging(app),
        serviceWorkerRegistration,
    };
}

function getMessagingContext() {
    if (!messagingContextPromise) {
        messagingContextPromise = createMessagingContext().catch((error) => {
            messagingContextPromise = null;
            throw error;
        });
    }
    return messagingContextPromise;
}

export async function registerForPushNotifications() {
    const { messaging, serviceWorkerRegistration } = await getMessagingContext();

    return new Promise<string>((resolve, reject) => {
        let settled = false;
        let timeout = 0;
        let stopListening: () => void = () => undefined;
        const finish = (callback: () => void) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeout);
            stopListening();
            callback();
        };
        stopListening = onRegistered(messaging, (installationId) => {
            finish(() => resolve(installationId));
        });
        timeout = window.setTimeout(() => {
            finish(() => reject(new Error('알림 기기 등록 시간이 초과됐어요. 다시 시도해 주세요.')));
        }, 15_000);

        void register(messaging, { vapidKey, serviceWorkerRegistration }).catch((error: unknown) => {
            finish(() => reject(error));
        });
    });
}

export async function unregisterFromPushNotifications() {
    const { messaging } = await getMessagingContext();
    await unregister(messaging);
}

export async function listenToPushNotifications(listeners: PushListeners) {
    const { messaging, serviceWorkerRegistration } = await getMessagingContext();
    const stopRegistered = onRegistered(messaging, listeners.onTargetRegistered);
    const stopUnregistered = onUnregistered(messaging, listeners.onTargetUnregistered);
    const stopMessage = onMessage(messaging, listeners.onMessageReceived);

    try {
        await register(messaging, { vapidKey, serviceWorkerRegistration });
    } catch (error) {
        stopRegistered();
        stopUnregistered();
        stopMessage();
        throw error;
    }

    return () => {
        stopRegistered();
        stopUnregistered();
        stopMessage();
    };
}
