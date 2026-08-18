import { Link } from 'react-router'
import { EmptyState, InlineNotice } from '../components/ui'
import { AuthGate, PageHeader } from '../layouts/AppLayout'

export function NotificationsPage() {
    return (
        <AuthGate>
            <div className="notifications-page page-container">
                <PageHeader title="알림" description="모집 시작, 모집 완료, 그룹과 역할 소식을 확인하세요." />
                <div className="notification-status">
                    <div className="notification-status__mark">
                        <span />
                        <span />
                    </div>
                    <div>
                        <h2>알림 목록 API가 아직 없어요</h2>
                        <p>현재 Swagger에는 FCM 토큰 저장 API만 있고 알림 목록·읽음 처리 API는 제공되지 않습니다.</p>
                    </div>
                </div>
                <EmptyState
                    title="표시할 알림이 없어요"
                    description="백엔드에 알림 조회 API가 추가되면 오늘, 어제, 이전 순으로 이곳에 표시됩니다."
                    action={
                        <Link className="button button--secondary" to="/settings">
                            알림 연결 상태 보기
                        </Link>
                    }
                />
                <InlineNotice title="지원 중인 범위">
                    사용자 FCM 토큰은 실제 API로 저장할 수 있습니다. Firebase 프로젝트 설정이 연결된 뒤 브라우저 토큰
                    발급을 활성화합니다.
                </InlineNotice>
            </div>
        </AuthGate>
    )
}
