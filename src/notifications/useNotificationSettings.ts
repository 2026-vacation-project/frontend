import { useEffect, useState } from 'react';
import { usersApi } from '../api/users';
import { useApp } from '../context/useApp';
import { getErrorMessage } from '../utils/format';
import {
    getNotificationPreference,
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
    const [webPushRequesting, setWebPushRequesting] = useState(false);
    const webPushEnabled = Boolean(
        currentUser?.fcm_token && permission === 'granted' && getNotificationPreference(currentUser.id) === 'on',
    );

    useEffect(() => {
        const syncPermission = () => {
            setPermission('Notification' in window ? Notification.permission : 'denied');
        };
        window.addEventListener('focus', syncPermission);
        return () => window.removeEventListener('focus', syncPermission);
    }, []);

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

        setWebPushRequesting(true);
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
            setNotificationPreference(currentUser.id, true);
            await refreshCurrentUser();
            showToast('이 브라우저의 웹 푸시 알림을 켰어요.', 'success');
            return true;
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
            return false;
        } finally {
            setWebPushRequesting(false);
        }
    }

    async function disableWebPush() {
        if (!currentUser || !webPushEnabled) return;
        setWebPushRequesting(true);
        try {
            await unregisterFromPushNotifications().catch(() => undefined);
            await usersApi.updateFcmToken(currentUser.id, '');
            setNotificationPreference(currentUser.id, false);
            await refreshCurrentUser();
            showToast('이 브라우저의 웹 푸시 알림을 껐어요.', 'success');
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setWebPushRequesting(false);
        }
    }

    return {
        permission,
        webPushRequesting,
        webPushEnabled,
        enableWebPush,
        disableWebPush,
    };
}
