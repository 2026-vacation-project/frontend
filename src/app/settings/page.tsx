import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { css } from '../../appStyles';
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
    const { permission, webPushRequesting, webPushEnabled, enableWebPush, disableWebPush } = useNotificationSettings();
    const [loggingOutAll, setLoggingOutAll] = useState(false);
    const { confirm, dialog: confirmDialog } = useConfirmDialog();

    useEffect(() => {
        const refresh = () => void refreshCurrentUser().catch(() => undefined);
        window.addEventListener('focus', refresh);
        return () => window.removeEventListener('focus', refresh);
    }, [refreshCurrentUser]);

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
                <PageHeader title="설정" description="웹 푸시 알림과 로그인한 기기를 관리할 수 있어요." />
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
                            <h2>알림 받을 곳</h2>
                            <p>현재 브라우저에서 웹 푸시 알림을 켜거나 끌 수 있어요.</p>
                        </div>
                    </div>
                    <div className={css('settings-row')}>
                        <div>
                            <strong>웹 푸시</strong>
                            <p>
                                {webPushEnabled
                                    ? '이 브라우저에서 새 모집과 모집 완료 소식을 받아요.'
                                    : permission === 'denied'
                                      ? '인터넷 앱 설정에서 팀모아 알림 권한을 허용해 주세요.'
                                      : '현재 브라우저에서 바로 알림을 받을 수 있어요.'}
                            </p>
                        </div>
                        <div className={css('settings-row__actions')}>
                            <span
                                className={css(
                                    'permission',
                                    webPushEnabled ? 'permission--granted' : 'permission--default',
                                )}
                            >
                                {webPushEnabled ? '켜짐' : '꺼짐'}
                            </span>
                            <Button
                                tone={webPushEnabled ? 'quiet' : 'secondary'}
                                onClick={() => void (webPushEnabled ? disableWebPush() : enableWebPush())}
                                loading={webPushRequesting}
                                aria-pressed={webPushEnabled}
                            >
                                {webPushEnabled ? '웹 푸시 끄기' : '웹 푸시 켜기'}
                            </Button>
                        </div>
                    </div>
                </section>

                <section className={css('settings-section')}>
                    <h2>알림 종류</h2>
                    {notificationKinds.map(([label, description]) => (
                        <div className={css('settings-row')} key={label}>
                            <div>
                                <strong>{label}</strong>
                                <p>{description}</p>
                            </div>
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
