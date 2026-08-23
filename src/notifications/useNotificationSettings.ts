import { useEffect, useState } from 'react';
import { usersApi } from '../api/users';
import { useApp } from '../context/useApp';
import { getErrorMessage } from '../utils/format';
import {
    isFirebasePushConfigured,
    registerForPushNotifications,
    setNotificationPreference,
    unregisterFromPushNotifications,
} from './push';

export function useNotificationSettings() {
    const { currentUser, refreshCurrentUser, showToast } = useApp();
    const [permission, setPermission] = useState<NotificationPermission>(() =>
        'Notification' in window ? Notification.permission : 'denied',
    );
    const [requesting, setRequesting] = useState(false);
    const notificationsEnabled = Boolean(
        currentUser && (currentUser.notifications_enabled ?? Boolean(currentUser.fcm_token)),
    );
    const webPushConfigured = Boolean(currentUser?.fcm_token);
    const discordConnected = Boolean(currentUser?.discord_connected);

    useEffect(() => {
        const syncPermission = () => {
            setPermission('Notification' in window ? Notification.permission : 'denied');
        };
        window.addEventListener('focus', syncPermission);
        return () => window.removeEventListener('focus', syncPermission);
    }, []);

    async function savePreference(enabled: boolean) {
        if (!currentUser) return false;
        await usersApi.updateNotificationPreference(currentUser.id, enabled);
        await refreshCurrentUser();
        return true;
    }

    async function enableWebPush() {
        if (!currentUser) return false;
        if (!('Notification' in window)) {
            showToast('이 기기에서는 웹 푸시를 받을 수 없어요.', 'error');
            return false;
        }
        if (!isFirebasePushConfigured()) {
            showToast('웹 푸시 설정이 아직 준비되지 않았어요.', 'error');
            return false;
        }
        if (Notification.permission === 'denied') {
            showToast('사용 중인 인터넷 앱 설정에서 팀모아 알림을 허용해 주세요.', 'info');
            return false;
        }

        setRequesting(true);
        try {
            const next = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
            setPermission(next);
            if (next !== 'granted') {
                showToast(
                    next === 'denied'
                        ? '알림 권한이 차단됐어요. 인터넷 앱 설정에서 팀모아 알림을 허용해 주세요.'
                        : '알림 권한을 선택하지 않았어요. 다시 눌러 허용해 주세요.',
                    'info',
                );
                return false;
            }

            const installationId = await registerForPushNotifications();
            await usersApi.updateFcmToken(currentUser.id, installationId);
            await usersApi.updateNotificationPreference(currentUser.id, true);
            setNotificationPreference(currentUser.id, true);
            await refreshCurrentUser();
            showToast('이 브라우저의 웹 푸시 알림을 켰어요.', 'success');
            return true;
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
            return false;
        } finally {
            setRequesting(false);
        }
    }

    async function enableNotifications() {
        if (!currentUser) return;
        if (webPushConfigured || discordConnected) {
            setRequesting(true);
            try {
                await savePreference(true);
                setNotificationPreference(currentUser.id, true);
                showToast('알림을 켰어요.', 'success');
            } catch (error) {
                showToast(getErrorMessage(error), 'error');
            } finally {
                setRequesting(false);
            }
            return;
        }
        await enableWebPush();
    }

    async function disableNotifications() {
        if (!currentUser) return;
        setRequesting(true);
        try {
            await usersApi.updateNotificationPreference(currentUser.id, false);
            setNotificationPreference(currentUser.id, false);
            if (webPushConfigured) {
                await unregisterFromPushNotifications().catch(() => undefined);
                await usersApi.updateFcmToken(currentUser.id, '');
            }
            await refreshCurrentUser();
            showToast('알림을 껐어요.', 'success');
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setRequesting(false);
        }
    }

    async function disableWebPush() {
        if (!currentUser || !webPushConfigured) return;
        setRequesting(true);
        try {
            await unregisterFromPushNotifications().catch(() => undefined);
            await usersApi.updateFcmToken(currentUser.id, '');
            if (!discordConnected) await usersApi.updateNotificationPreference(currentUser.id, false);
            await refreshCurrentUser();
            showToast(
                discordConnected ? '웹 푸시를 해제했어요. 알림은 Discord DM으로 보내요.' : '웹 푸시를 해제했어요.',
                'success',
            );
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setRequesting(false);
        }
    }

    return {
        permission,
        requesting,
        notificationsEnabled,
        webPushConfigured,
        discordConnected,
        enableWebPush,
        enableNotifications,
        disableNotifications,
        disableWebPush,
    };
}
