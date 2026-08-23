import { useState } from 'react';
import { css } from '../../appStyles';
import { useApp } from '../../context/useApp';
import { useNotificationSettings } from '../../notifications/useNotificationSettings';
import { Button, IconButton } from '../ui';
import { Icon } from '../ui/Icon';

function dismissalKey(userId: string) {
    return `teammoa-web-push-prompt-dismissed:${userId}`;
}

export function NotificationPrompt() {
    const { currentUser } = useApp();
    const { requesting, webPushConfigured, enableWebPush } = useNotificationSettings();
    const [dismissedUserId, setDismissedUserId] = useState<string | null>(null);
    const dismissed = Boolean(
        currentUser &&
        (dismissedUserId === currentUser.id || sessionStorage.getItem(dismissalKey(currentUser.id)) === 'true'),
    );

    if (!currentUser || webPushConfigured || dismissed) return null;

    function dismiss() {
        if (!currentUser) return;
        sessionStorage.setItem(dismissalKey(currentUser.id), 'true');
        setDismissedUserId(currentUser.id);
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
