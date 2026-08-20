import { Link } from 'react-router';
import { css } from '../../appStyles';
import { EmptyState } from '../../components/ui';
import { AuthGate, PageHeader } from '../layout';

export default function NotificationsPage() {
    return (
        <AuthGate>
            <div className={css('notifications-page page-container')}>
                <PageHeader title="알림" description="모집 시작, 모집 완료, 그룹과 역할 소식을 확인하세요." />
                <div className={css('notification-status')}>
                    <div className={css('notification-status__mark')}>
                        <span />
                        <span />
                    </div>
                    <div>
                        <h2>새 소식을 한곳에서 확인하세요</h2>
                        <p>모집과 그룹에 새로운 소식이 생기면 놓치지 않도록 모아드릴게요.</p>
                    </div>
                </div>
                <EmptyState
                    title="아직 새로운 알림이 없어요"
                    description="새 모집을 둘러보거나 그룹 활동을 시작해 보세요. 소식이 생기면 이곳에 알려드릴게요."
                    action={
                        <Link className={css('button button--primary')} to="/rooms">
                            모집방 둘러보기
                        </Link>
                    }
                />
            </div>
        </AuthGate>
    );
}
