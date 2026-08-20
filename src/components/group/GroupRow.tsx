import { Link } from 'react-router';
import { css } from '../../appStyles';
import type { GroupResponse } from '../../types/api';
import { Icon } from '../ui/Icon';

export function GroupRow({
    group,
    active,
    onSelect,
}: {
    group: GroupResponse;
    active?: boolean;
    onSelect?: (groupId: number) => void;
}) {
    return (
        <article className={css('group-row', active && 'is-active')}>
            <button className={css('group-row__select')} onClick={() => onSelect?.(group.id)} aria-pressed={active}>
                <span className={css('group-mark')} aria-hidden="true">
                    {group.name.slice(0, 1)}
                </span>
                <span>
                    <strong>{group.name}</strong>
                    <small>멤버 {group.members?.length ?? 0}명</small>
                </span>
            </button>
            <Link to={`/groups/${group.id}`} aria-label={`${group.name} 상세 보기`}>
                <Icon name="chevron" />
            </Link>
        </article>
    );
}
