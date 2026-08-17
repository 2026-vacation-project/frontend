import { Link } from 'react-router'
import { EmptyState } from '../components/ui'

export function NotFoundPage() {
  return <div className="page-container not-found"><EmptyState title="페이지를 찾을 수 없어요" description="주소가 바뀌었거나 존재하지 않는 페이지예요." action={<Link className="button button--primary" to="/">홈으로 가기</Link>} /></div>
}
