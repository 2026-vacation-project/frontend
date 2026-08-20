import { Link } from 'react-router';
import { css } from '../appStyles';
import { EmptyState } from '../components/ui';

export default function NotFoundPage() {
    return (
        <div className={css('page-container not-found')}>
            <EmptyState
                title="페이지를 찾을 수 없어요"
                description="주소가 바뀌었거나 존재하지 않는 페이지예요."
                action={
                    <Link className={css('button button--primary')} to="/">
                        홈으로 가기
                    </Link>
                }
            />
        </div>
    );
}
