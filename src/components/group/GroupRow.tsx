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
    onSelect?: (groupId: string) => void;
}) {
    const label = (
        <>
            <span className={css('group-mark')} aria-hidden="true">
                {group.name.slice(0, 1)}
            </span>
            <span>
                <strong>{group.name}</strong>
                <small>
                    {!group.is_public && '비공개 · '}멤버 {group.members?.length ?? 0}명
                </small>
            </span>
        </>
    );

    return (
        <article className={css('group-row', active && 'is-active')}>
            <Link className={css('group-row__link')} to={`/groups/${group.id}`} onClick={() => onSelect?.(group.id)}>
                {label}
                <Icon name="chevron" aria-hidden="true" />
            </Link>
        </article>
    );
}
