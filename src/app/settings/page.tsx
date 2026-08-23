import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { authApi } from '../../api/auth';
import { css } from '../../appStyles';
import { createOAuthAuthorizationUrl } from '../../auth/oauth';
import { Button } from '../../components/ui';
import { useConfirmDialog } from '../../components/ui/useConfirmDialog';
import { useApp } from '../../context/useApp';
import { useNotificationSettings } from '../../notifications/useNotificationSettings';
import { getErrorMessage, userDisplayName } from '../../utils/format';
import { AuthGate, PageHeader } from '../layout';

const notificationKinds = [
    ['그룹 모집', '참여 중인 그룹의 새 모집'],
    ['모집 완료', '참여한 모집의 인원이 모두 모였을 때'],
] as const;

export default function SettingsPage() {
    const navigate = useNavigate();
    const { currentUser, logoutAll, refreshCurrentUser, showToast } = useApp();
    const {
        permission,
        requesting,
        notificationsEnabled,
        webPushConfigured,
        discordConnected,
        enableWebPush,
        enableNotifications,
        disableNotifications,
        disableWebPush,
    } = useNotificationSettings();
    const [linkingDiscord, setLinkingDiscord] = useState(false);
    const [loggingOutAll, setLoggingOutAll] = useState(false);
    const { confirm, dialog: confirmDialog } = useConfirmDialog();

    useEffect(() => {
        const refresh = () => void refreshCurrentUser().catch(() => undefined);
        window.addEventListener('focus', refresh);
        return () => window.removeEventListener('focus', refresh);
    }, [refreshCurrentUser]);

    function connectDiscord() {
        setLinkingDiscord(true);
        try {
            window.location.assign(createOAuthAuthorizationUrl('discord', '/settings', 'link'));
        } catch (error) {
            setLinkingDiscord(false);
            showToast(getErrorMessage(error), 'error');
        }
    }

    async function disconnectDiscord() {
        const confirmed = await confirm({
            title: 'Discord 연결을 해제할까요?',
            description: 'Discord DM 알림이 꺼지고 공용 알림 설정도 꺼짐으로 바뀝니다.',
            confirmLabel: '연결 해제',
            tone: 'danger',
        });
        if (!confirmed) return;

        setLinkingDiscord(true);
        try {
            await authApi.unlinkDiscord();
            await refreshCurrentUser();
            showToast('Discord 연결을 해제했어요.', 'success');
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setLinkingDiscord(false);
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

    const activeDelivery = webPushConfigured ? '웹 푸시' : discordConnected ? 'Discord DM' : null;

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
                            <p>
                                {notificationsEnabled && activeDelivery
                                    ? `${activeDelivery}로 새 모집과 모집 완료 소식을 받고 있어요.`
                                    : '새 모집과 모집 완료 소식을 받을 수 있어요.'}
                            </p>
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
                            <strong>전체 알림</strong>
                            <p>웹과 Discord에서 같은 설정을 사용해요.</p>
                        </div>
                        <Button
                            tone={notificationsEnabled ? 'quiet' : 'secondary'}
                            onClick={() => void (notificationsEnabled ? disableNotifications() : enableNotifications())}
                            loading={requesting}
                            aria-pressed={notificationsEnabled}
                        >
                            {notificationsEnabled ? '알림 끄기' : '알림 켜기'}
                        </Button>
                    </div>
                </section>

                <section className={css('settings-section')}>
                    <h2>알림 받을 곳</h2>
                    <div className={css('settings-row')}>
                        <div>
                            <strong>웹 푸시</strong>
                            <p>
                                {webPushConfigured
                                    ? '이 브라우저가 FCM 알림 대상으로 설정되어 있어요.'
                                    : permission === 'denied'
                                      ? '인터넷 앱 설정에서 팀모아 알림 권한을 허용해 주세요.'
                                      : '설정하면 Discord보다 웹 푸시로만 알림을 보내요.'}
                            </p>
                        </div>
                        <div className={css('settings-row__actions')}>
                            <span
                                className={css(
                                    'permission',
                                    webPushConfigured ? 'permission--granted' : 'permission--default',
                                )}
                            >
                                {webPushConfigured ? '설정됨' : '미설정'}
                            </span>
                            <Button
                                tone={webPushConfigured ? 'quiet' : 'secondary'}
                                onClick={() => void (webPushConfigured ? disableWebPush() : enableWebPush())}
                                loading={requesting}
                            >
                                {webPushConfigured ? '웹 푸시 해제' : '웹 푸시 켜기'}
                            </Button>
                        </div>
                    </div>
                    <div className={css('settings-row')}>
                        <div>
                            <strong>Discord DM</strong>
                            <p>
                                {discordConnected
                                    ? '웹 푸시가 설정되지 않았을 때 Bot이 Embed DM을 보내요.'
                                    : '연결하면 Bot DM의 버튼으로도 알림을 켜고 끌 수 있어요.'}
                            </p>
                        </div>
                        <div className={css('settings-row__actions')}>
                            <span
                                className={css(
                                    'permission',
                                    discordConnected ? 'permission--granted' : 'permission--default',
                                )}
                            >
                                {discordConnected ? '연결됨' : '연결 안 됨'}
                            </span>
                            <Button
                                tone={discordConnected ? 'quiet' : 'secondary'}
                                onClick={() => void (discordConnected ? disconnectDiscord() : connectDiscord())}
                                loading={linkingDiscord}
                            >
                                {discordConnected ? '연결 해제' : 'Discord 연결'}
                            </Button>
                        </div>
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
