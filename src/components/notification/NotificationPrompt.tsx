import { useEffect, useState } from 'react';
import { css } from '../../appStyles';
import { authSessionChangedEvent } from '../../auth/session';
import { useApp } from '../../context/useApp';
import { dismissWebPushPrompt, hasDismissedWebPushPrompt } from '../../notifications/promptStorage';
import { useNotificationSettings } from '../../notifications/useNotificationSettings';
import { Button, IconButton } from '../ui';
import { Icon } from '../ui/Icon';

export function NotificationPrompt() {
    const { currentUser } = useApp();
    const { webPushRequesting, webPushEnabled, enableWebPush } = useNotificationSettings();
    const [dismissed, setDismissed] = useState(hasDismissedWebPushPrompt);

    useEffect(() => {
        const syncDismissal = () => setDismissed(hasDismissedWebPushPrompt());
        window.addEventListener(authSessionChangedEvent, syncDismissal);
        return () => window.removeEventListener(authSessionChangedEvent, syncDismissal);
    }, []);

    if (!currentUser || webPushEnabled || dismissed) return null;

    function dismiss() {
        if (!currentUser) return;
        dismissWebPushPrompt();
        setDismissed(true);
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
                <Button tone="secondary" loading={webPushRequesting} onClick={() => void enableWebPush()}>
                    웹 푸시 켜기
                </Button>
                <IconButton label="알림 안내 닫기" icon="close" onClick={dismiss} />
            </div>
        </aside>
    );
}
