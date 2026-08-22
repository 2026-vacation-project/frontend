import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { usersApi } from '../../api/users';
import { css } from '../../appStyles';
import { Button } from '../../components/ui';
import { useConfirmDialog } from '../../components/ui/useConfirmDialog';
import { useApp } from '../../context/useApp';
import {
    getNotificationPreference,
    isFirebasePushConfigured,
    registerForPushNotifications,
    setNotificationPreference,
    unregisterFromPushNotifications,
} from '../../notifications/push';
import { getErrorMessage, userDisplayName } from '../../utils/format';
import { AuthGate, PageHeader } from '../layout';

const notificationKinds = [
    ['그룹 모집', '참여 중인 그룹의 새 모집'],
    ['모집 완료', '참여한 모집의 인원이 모두 모였을 때'],
] as const;

export default function SettingsPage() {
    const navigate = useNavigate();
    const { currentUser, logoutAll, refreshCurrentUser, showToast } = useApp();
    const [permission, setPermission] = useState<NotificationPermission>(() =>
        'Notification' in window ? Notification.permission : 'denied',
    );
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        if (!currentUser) return false;
        return (
            'Notification' in window &&
            Notification.permission === 'granted' &&
            getNotificationPreference(currentUser.id) !== 'off' &&
            Boolean(currentUser.fcm_token)
        );
    });
    const [requesting, setRequesting] = useState(false);
    const [loggingOutAll, setLoggingOutAll] = useState(false);
    const { confirm, dialog: confirmDialog } = useConfirmDialog();

    useEffect(() => {
        const syncPermission = () => {
            const next = 'Notification' in window ? Notification.permission : 'denied';
            setPermission(next);
            setNotificationsEnabled(
                Boolean(
                    currentUser &&
                    next === 'granted' &&
                    getNotificationPreference(currentUser.id) !== 'off' &&
                    currentUser.fcm_token,
                ),
            );
        };

        syncPermission();
        window.addEventListener('focus', syncPermission);
        return () => window.removeEventListener('focus', syncPermission);
    }, [currentUser]);

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

            if (!currentUser) return;
            const installationId = await registerForPushNotifications();
            await usersApi.updateFcmToken(currentUser.id, installationId);
            setNotificationPreference(currentUser.id, true);
            await refreshCurrentUser();
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
            if (currentUser) {
                setNotificationPreference(currentUser.id, false);
                try {
                    await unregisterFromPushNotifications();
                } catch {
                    // 서버에서 수신 대상을 지우면 알림은 더 이상 전송되지 않는다.
                }
                await usersApi.updateFcmToken(currentUser.id, '');
                await refreshCurrentUser();
            }

            setNotificationsEnabled(false);
            showToast('알림을 껐어요.', 'success');
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setRequesting(false);
        }
    }

    async function handleLogoutAll() {
        const confirmed = await confirm({
            title: '모든 기기에서 로그아웃할까요?',
            description: '다른 기기의 로그인도 끝나며, 참가 중인 모든 모집방에서도 나가게 됩니다.',
            confirmLabel: '모두 로그아웃',
            tone: 'danger',
        });
        if (!confirmed) return;

        setLoggingOutAll(true);
        try {
            await logoutAll();
            navigate('/');
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setLoggingOutAll(false);
        }
    }

    return (
        <AuthGate>
            <div className={css('settings-page page-container')}>
                <PageHeader title="설정" description="알림을 정하고 로그인한 기기를 관리할 수 있어요." />
                {currentUser && (
                    <section className={css('settings-section')}>
                        <h2>계정 정보</h2>
                        <div className={css('settings-row')}>
                            <div>
                                <strong>표시 이름</strong>
                                <p>{userDisplayName(currentUser)}</p>
                            </div>
                        </div>
                        <div className={css('settings-row')}>
                            <div>
                                <strong>이메일</strong>
                                <p>{currentUser.email}</p>
                            </div>
                        </div>
                    </section>
                )}
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
                                    : !isFirebasePushConfigured()
                                      ? '알림을 보내기 위한 설정이 아직 준비되지 않았어요.'
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
                <section className={css('settings-section')}>
                    <h2>로그인한 기기</h2>
                    <div className={css('settings-row')}>
                        <div>
                            <strong>모든 기기에서 로그아웃</strong>
                            <p>다른 기기의 로그인도 끝나며, 참가 중인 모든 모집방에서 나가게 됩니다.</p>
                        </div>
                        <Button tone="danger" loading={loggingOutAll} onClick={() => void handleLogoutAll()}>
                            모두 로그아웃
                        </Button>
                    </div>
                </section>
                {confirmDialog}
            </div>
        </AuthGate>
    );
}
