import { useEffect, useState } from 'react';
import { usersApi } from '../../api/users';
import { css } from '../../appStyles';
import { Button } from '../../components/ui';
import { useApp } from '../../context/useApp';
import { getErrorMessage } from '../../utils/format';
import { AuthGate, PageHeader } from '../layout';

const notificationKinds = [
    ['관심 게임 모집', '관심 게임의 새 모집'],
    ['그룹 모집', '참여 중인 그룹의 새 모집'],
    ['모집 완료', '참여한 모집의 마감'],
    ['그룹과 역할', '그룹 정보나 역할 변경'],
] as const;

const notificationPreferenceKey = 'teammoa-notifications';
const notificationTokenBackupKey = 'teammoa-notification-token';

function userStorageKey(key: string, userId?: string) {
    return `${key}:${userId ?? 'signed-out'}`;
}

export default function SettingsPage() {
    const { currentUser, refreshCurrentUser, showToast } = useApp();
    const [permission, setPermission] = useState<NotificationPermission>(() =>
        'Notification' in window ? Notification.permission : 'denied',
    );
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        const saved = localStorage.getItem(userStorageKey(notificationPreferenceKey, currentUser?.id));
        return 'Notification' in window && Notification.permission === 'granted' && saved !== 'off';
    });
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        const syncPermission = () => {
            const next = 'Notification' in window ? Notification.permission : 'denied';
            const saved = localStorage.getItem(userStorageKey(notificationPreferenceKey, currentUser?.id));
            setPermission(next);
            setNotificationsEnabled(next === 'granted' && saved !== 'off');
        };

        window.addEventListener('focus', syncPermission);
        return () => window.removeEventListener('focus', syncPermission);
    }, [currentUser?.id]);

    async function turnOnNotifications() {
        if (!('Notification' in window)) {
            showToast('이 기기에서는 알림을 받을 수 없어요.', 'error');
            return;
        }

        if (Notification.permission === 'denied') {
            showToast('사용 중인 인터넷 앱 설정에서 팀모아 알림을 켜 주세요.', 'info');
            return;
        }

        setRequesting(true);
        try {
            const next = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
            setPermission(next);

            if (next !== 'granted') {
                showToast('알림을 켜지 못했어요.', 'info');
                return;
            }

            if (currentUser && !currentUser.fcm_token) {
                const savedToken = localStorage.getItem(userStorageKey(notificationTokenBackupKey, currentUser.id));
                if (savedToken) {
                    await usersApi.updateFcmToken(currentUser.id, savedToken);
                    await refreshCurrentUser();
                }
            }

            localStorage.setItem(userStorageKey(notificationPreferenceKey, currentUser?.id), 'on');
            setNotificationsEnabled(true);
            showToast('알림을 켰어요.', 'success');
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setRequesting(false);
        }
    }

    async function turnOffNotifications() {
        setRequesting(true);
        try {
            if (currentUser?.fcm_token) {
                localStorage.setItem(userStorageKey(notificationTokenBackupKey, currentUser.id), currentUser.fcm_token);
                await usersApi.updateFcmToken(currentUser.id, '');
                await refreshCurrentUser();
            }

            localStorage.setItem(userStorageKey(notificationPreferenceKey, currentUser?.id), 'off');
            setNotificationsEnabled(false);
            showToast('알림을 껐어요.', 'success');
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setRequesting(false);
        }
    }

    return (
        <AuthGate>
            <div className={css('settings-page page-container')}>
                <PageHeader title="설정" description="새 소식을 알림으로 받을지 정할 수 있어요." />
                <section className={css('settings-section')}>
                    <div className={css('settings-section__heading')}>
                        <div>
                            <h2>새 소식 알림</h2>
                            <p>새 모집과 그룹 소식을 알려드려요.</p>
                        </div>
                        <span
                            className={css(
                                'permission',
                                notificationsEnabled ? 'permission--granted' : 'permission--denied',
                            )}
                        >
                            {notificationsEnabled ? '켜짐' : '꺼짐'}
                        </span>
                    </div>
                    <div className={css('settings-row')}>
                        <div>
                            <strong>알림 받기</strong>
                            <p>
                                {permission === 'denied'
                                    ? '사용 중인 인터넷 앱의 설정에서 팀모아 알림을 켜 주세요.'
                                    : notificationsEnabled
                                      ? '새 모집과 그룹 소식을 알려드리고 있어요.'
                                      : '원할 때 다시 켤 수 있어요.'}
                            </p>
                        </div>
                        <Button
                            tone={notificationsEnabled ? 'quiet' : 'secondary'}
                            onClick={() => void (notificationsEnabled ? turnOffNotifications() : turnOnNotifications())}
                            loading={requesting}
                            aria-pressed={notificationsEnabled}
                        >
                            {notificationsEnabled ? '알림 끄기' : '알림 켜기'}
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
                            <span
                                className={css(
                                    'permission',
                                    notificationsEnabled ? 'permission--granted' : 'permission--denied',
                                )}
                            >
                                {notificationsEnabled ? '받는 중' : '꺼짐'}
                            </span>
                        </div>
                    ))}
                </section>
            </div>
        </AuthGate>
    );
}
