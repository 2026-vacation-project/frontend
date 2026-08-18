import { useState } from 'react'
import { usersApi } from '../api/users'
import { Button, InlineNotice } from '../components/ui'
import { useApp } from '../context/useApp'
import { AuthGate, PageHeader } from '../layouts/AppLayout'
import { getErrorMessage } from '../utils/format'

export function SettingsPage() {
    const { currentUser, refreshCurrentUser, showToast } = useApp()
    const [permission, setPermission] = useState<NotificationPermission>(() =>
        'Notification' in window ? Notification.permission : 'denied',
    )
    const [requesting, setRequesting] = useState(false)

    async function requestPermission() {
        if (!('Notification' in window)) {
            showToast('이 브라우저는 웹 알림을 지원하지 않아요.', 'error')
            return
        }
        setRequesting(true)
        const next = await Notification.requestPermission()
        setPermission(next)
        setRequesting(false)
        showToast(
            next === 'granted' ? '브라우저 알림 권한을 허용했어요.' : '알림 권한이 허용되지 않았어요.',
            next === 'granted' ? 'success' : 'info',
        )
    }

    async function clearToken() {
        if (!currentUser) return
        try {
            await usersApi.updateFcmToken(currentUser.id, '')
            await refreshCurrentUser()
            showToast('저장된 알림 토큰을 해제했어요.', 'success')
        } catch (error) {
            showToast(getErrorMessage(error), 'error')
        }
    }

    return (
        <AuthGate>
            <div className="settings-page page-container">
                <PageHeader title="설정" description="알림 연결과 계정 상태를 확인하세요." />
                <section className="settings-section">
                    <div className="settings-section__heading">
                        <div>
                            <h2>웹 푸시 알림</h2>
                            <p>기능을 켜려는 순간에만 브라우저 권한을 요청합니다.</p>
                        </div>
                        <span className={`permission permission--${permission}`}>
                            {permission === 'granted' ? '허용됨' : permission === 'denied' ? '차단됨' : '확인 전'}
                        </span>
                    </div>
                    <div className="settings-row">
                        <div>
                            <strong>브라우저 알림 권한</strong>
                            <p>새 모집과 모집 완료 알림을 받을 수 있도록 허용합니다.</p>
                        </div>
                        <Button
                            tone="secondary"
                            onClick={() => void requestPermission()}
                            loading={requesting}
                            disabled={permission === 'granted'}
                        >
                            {permission === 'granted' ? '권한 허용됨' : '권한 요청'}
                        </Button>
                    </div>
                    <div className="settings-row">
                        <div>
                            <strong>FCM 토큰</strong>
                            <p>
                                {currentUser?.fcm_token
                                    ? '백엔드에 토큰이 저장되어 있습니다.'
                                    : '등록된 토큰이 없습니다.'}
                            </p>
                        </div>
                        {currentUser?.fcm_token ? (
                            <Button tone="danger" onClick={() => void clearToken()}>
                                토큰 해제
                            </Button>
                        ) : (
                            <Button tone="secondary" disabled>
                                Firebase 설정 필요
                            </Button>
                        )}
                    </div>
                    <InlineNotice tone="warning" title="Firebase 설정이 필요해요">
                        FCM 토큰 발급에 필요한 Firebase 프로젝트 정보가 제공되지 않아 임의 토큰을 만들지 않습니다.
                    </InlineNotice>
                </section>
                <section className="settings-section">
                    <h2>알림 종류</h2>
                    {['관심 게임 모집', '그룹 모집', '모집 완료', '그룹 초대', '역할 변경'].map((label) => (
                        <div className="settings-row" key={label}>
                            <div>
                                <strong>{label}</strong>
                                <p>알림 설정 API가 추가되면 개별 설정을 저장할 수 있어요.</p>
                            </div>
                            <button className="switch" role="switch" aria-checked="false" disabled>
                                <span />
                            </button>
                        </div>
                    ))}
                </section>
            </div>
        </AuthGate>
    )
}
