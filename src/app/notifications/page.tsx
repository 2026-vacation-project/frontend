import { Link } from 'react-router';
import { css } from '../../appStyles';
import { EmptyState } from '../../components/ui';
import { AuthGate, PageHeader } from '../layout';

export default function NotificationsPage() {
    return (
        <AuthGate>
            <div className={css('notifications-page page-container')}>
                <PageHeader title="알림" description="모집과 그룹의 새 소식을 확인하세요." />
                <div className={css('notification-status')}>
                    <div className={css('notification-status__mark')}>
                        <span />
                        <span />
                    </div>
                    <div>
                        <h2>알림 설정</h2>
                        <p>새 소식을 받으려면 설정에서 알림을 켜 주세요.</p>
                    </div>
                </div>
                <EmptyState
                    title="새 알림이 없습니다"
                    description="모집이나 그룹에 새 소식이 생기면 여기에서 확인할 수 있어요."
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
