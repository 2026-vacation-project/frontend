import { useState } from 'react';
import { css } from '../../appStyles';
import { Button } from '../../components/ui';
import { useApp } from '../../context/useApp';
import { AuthGate, PageHeader } from '../layout';

const notificationKinds = [
    ['관심 게임 모집', '좋아하는 게임의 새 모집을 알려드려요.'],
    ['그룹 모집', '함께하는 그룹에 새 모집이 열리면 알려드려요.'],
    ['모집 완료', '참여한 모집의 인원이 모두 모이면 알려드려요.'],
    ['그룹과 역할', '그룹이나 역할에 변화가 생기면 알려드려요.'],
] as const;

export default function SettingsPage() {
    const { showToast } = useApp();
    const [permission, setPermission] = useState<NotificationPermission>(() =>
        'Notification' in window ? Notification.permission : 'denied',
    );
    const [requesting, setRequesting] = useState(false);

    async function requestPermission() {
        if (!('Notification' in window)) {
            showToast('이 브라우저는 웹 알림을 지원하지 않아요.', 'error');
            return;
        }
        setRequesting(true);
        const next = await Notification.requestPermission();
        setPermission(next);
        setRequesting(false);
        showToast(
            next === 'granted' ? '브라우저 알림 권한을 허용했어요.' : '알림 권한이 허용되지 않았어요.',
            next === 'granted' ? 'success' : 'info',
        );
    }

    return (
        <AuthGate>
            <div className={css('settings-page page-container')}>
                <PageHeader title="설정" description="팀모아에서 받고 싶은 소식을 편하게 관리하세요." />
                <section className={css('settings-section')}>
                    <div className={css('settings-section__heading')}>
                        <div>
                            <h2>브라우저 알림</h2>
                            <p>새로운 모집과 그룹 소식을 바로 받아보세요.</p>
                        </div>
                        <span className={css('permission', `permission--${permission}`)}>
                            {permission === 'granted' ? '허용됨' : permission === 'denied' ? '차단됨' : '확인 전'}
                        </span>
                    </div>
                    <div className={css('settings-row')}>
                        <div>
                            <strong>브라우저 알림 권한</strong>
                            <p>
                                {permission === 'denied'
                                    ? '브라우저 설정에서 팀모아 알림을 허용해 주세요.'
                                    : '필요할 때만 알림을 보내고 언제든 브라우저에서 끌 수 있어요.'}
                            </p>
                        </div>
                        <Button
                            tone="secondary"
                            onClick={() => void requestPermission()}
                            loading={requesting}
                            disabled={permission === 'granted'}
                        >
                            {permission === 'granted' ? '알림 켜짐' : '알림 켜기'}
                        </Button>
                    </div>
                </section>
                <section className={css('settings-section')}>
                    <h2>받을 수 있는 알림</h2>
                    {notificationKinds.map(([label, description]) => (
                        <div className={css('settings-row')} key={label}>
                            <div>
                                <strong>{label}</strong>
                                <p>{description}</p>
                            </div>
                            <span className={css('permission permission--default')}>자동</span>
                        </div>
                    ))}
                </section>
            </div>
        </AuthGate>
    );
}
