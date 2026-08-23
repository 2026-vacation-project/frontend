import { useState } from 'react';
import { usersApi } from '../../api/users';
import { css } from '../../appStyles';
import { useApp } from '../../context/useApp';
import {
    isFirebasePushConfigured,
    registerForPushNotifications,
    setNotificationPreference,
} from '../../notifications/push';
import { getErrorMessage } from '../../utils/format';
import { Button, IconButton } from '../ui';
import { Icon } from '../ui/Icon';

function dismissalKey(userId: string) {
    return `teammoa-web-push-prompt-dismissed:${userId}`;
}

export function NotificationPrompt() {
    const { currentUser, refreshCurrentUser, showToast } = useApp();
    const [requesting, setRequesting] = useState(false);
    const [dismissedUserId, setDismissedUserId] = useState<string | null>(null);
    const dismissed = Boolean(
        currentUser &&
        (dismissedUserId === currentUser.id || sessionStorage.getItem(dismissalKey(currentUser.id)) === 'true'),
    );

    if (!currentUser || currentUser.fcm_token || dismissed) return null;

    function dismiss() {
        if (!currentUser) return;
        sessionStorage.setItem(dismissalKey(currentUser.id), 'true');
        setDismissedUserId(currentUser.id);
    }

    async function enableWebPush() {
        if (!currentUser) return;
        if (!('Notification' in window)) {
            showToast('이 기기에서는 웹 푸시를 받을 수 없어요.', 'error');
            return;
        }
        if (!isFirebasePushConfigured()) {
            showToast('웹 푸시 설정이 아직 준비되지 않았어요.', 'error');
            return;
        }
        if (Notification.permission === 'denied') {
            showToast('사용 중인 인터넷 앱 설정에서 팀모아 알림을 허용해 주세요.', 'info');
            return;
        }

        setRequesting(true);
        try {
            const permission =
                Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
            if (permission !== 'granted') {
                showToast(
                    permission === 'denied'
                        ? '알림 권한이 차단됐어요. 인터넷 앱 설정에서 팀모아 알림을 허용해 주세요.'
                        : '알림 권한을 선택하지 않았어요. 웹 푸시 켜기를 다시 눌러 허용해 주세요.',
                    'info',
                );
                return;
            }

            const installationId = await registerForPushNotifications();
            await usersApi.updateFcmToken(currentUser.id, installationId);
            setNotificationPreference(currentUser.id, true);
            await refreshCurrentUser();
            showToast('이 브라우저의 웹 푸시 알림을 켰어요.', 'success');
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setRequesting(false);
        }
    }

    return (
        <aside className={css('notification-prompt')} aria-label="웹 푸시 알림 안내">
            <div className={css('notification-prompt__inner')}>
                <span className={css('notification-prompt__icon')} aria-hidden="true">
                    <Icon name="bell" />
                </span>
                <div className={css('notification-prompt__copy')}>
                    <strong>모집 타이밍을 놓치지 마세요</strong>
                    <p>이 브라우저에서 새 모집과 모집 완료 소식을 바로 받을 수 있어요.</p>
                </div>
                <Button tone="secondary" loading={requesting} onClick={() => void enableWebPush()}>
                    웹 푸시 켜기
                </Button>
                <IconButton label="알림 안내 닫기" icon="close" onClick={dismiss} />
            </div>
        </aside>
    );
}
