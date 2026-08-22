import { useEffect, useId } from 'react';
import { animated, type SpringValues, useTransition } from '@react-spring/web';
import { createPortal } from 'react-dom';
import { css } from '../../appStyles';
import { Icon, type IconName } from './Icon';
import { initials } from '../../utils/format';

export function Button({
    children,
    tone = 'primary',
    icon,
    loading = false,
    className = '',
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: 'primary' | 'secondary' | 'quiet' | 'danger';
    icon?: IconName;
    loading?: boolean;
}) {
    return (
        <button className={css('button', `button--${tone}`, className)} disabled={loading || props.disabled} {...props}>
            {icon && <Icon name={icon} className={css('button__icon')} />}
            <span>{loading ? '처리 중…' : children}</span>
        </button>
    );
}

export function IconButton({
    label,
    icon,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; icon: IconName }) {
    return (
        <button className={css('icon-button')} aria-label={label} title={label} {...props}>
            <Icon name={icon} />
        </button>
    );
}

export function Field({
    label,
    hint,
    error,
    children,
}: {
    label: string;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className={css('field')}>
            <span className={css('field__label')}>{label}</span>
            {children}
            {error ? (
                <span className={css('field__error')}>{error}</span>
            ) : hint ? (
                <span className={css('field__hint')}>{hint}</span>
            ) : null}
        </label>
    );
}

export function SearchInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const id = useId();
    const accessibleLabel = props['aria-label'] ?? props.placeholder ?? '검색';
    return (
        <label className={css('search-input')} htmlFor={id}>
            <Icon name="search" />
            <input {...props} id={id} type="search" aria-label={accessibleLabel} />
        </label>
    );
}

export function Avatar({ name, src, size = 'md' }: { name: string; src?: string | null; size?: 'sm' | 'md' | 'lg' }) {
    return src ? (
        <img className={css('avatar', `avatar--${size}`)} src={src} alt={`${name} 사진`} draggable={false} />
    ) : (
        <span className={css('avatar', `avatar--${size}`)} aria-label={`${name} 사진`}>
            {initials(name)}
        </span>
    );
}

export function RoleBadge({ name, color }: { name: string; color: string }) {
    return (
        <span className={css('role-label')}>
            <span className={css('role-label__dot')} style={{ backgroundColor: color }} />
            {name}
        </span>
    );
}

export function StatusLabel({ status }: { status: 'RECRUITING' | 'COMPLETED' | 'CANCELLED' }) {
    const labels = { RECRUITING: '모집 중', COMPLETED: '모집 완료', CANCELLED: '취소됨' };
    return (
        <span className={css('status', `status--${status.toLowerCase()}`)}>
            <span aria-hidden="true" />
            {labels[status]}
        </span>
    );
}

export function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className={css('empty-state')}>
            <h2>{title}</h2>
            <p>{description}</p>
            {action}
        </div>
    );
}

export function LoadingRows({ count = 4 }: { count?: number }) {
    return (
        <div className={css('loading-rows')} aria-label="목록 불러오는 중" aria-busy="true">
            {Array.from({ length: count }, (_, index) => (
                <div className={css('skeleton-row')} key={index}>
                    <span />
                    <span />
                    <span />
                </div>
            ))}
        </div>
    );
}

export function InlineNotice({
    tone = 'info',
    title,
    children,
}: {
    tone?: 'info' | 'error' | 'warning';
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className={css('notice', `notice--${tone}`)} role={tone === 'error' ? 'alert' : 'status'}>
            <strong>{title}</strong>
            <p>{children}</p>
        </div>
    );
}

export function Modal({
    open,
    title,
    onClose,
    children,
}: {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    const transitions = useTransition(open, {
        from: { opacity: 0, transform: 'translateY(8px)' },
        enter: { opacity: 1, transform: 'translateY(0px)' },
        leave: { opacity: 0, transform: 'translateY(8px)' },
        config: { tension: 300, friction: 28 },
    });

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    return createPortal(
        transitions((styles, visible) =>
            visible ? (
                <animated.div
                    className={css('modal-backdrop')}
                    style={{ opacity: styles.opacity }}
                    onMouseDown={(event) => event.target === event.currentTarget && onClose()}
                >
                    <animated.section
                        className={css('modal')}
                        style={{ transform: styles.transform }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                    >
                        <header>
                            <h2 id="modal-title">{title}</h2>
                            <IconButton icon="close" label="닫기" onClick={onClose} />
                        </header>
                        {children}
                    </animated.section>
                </animated.div>
            ) : null,
        ),
        document.body,
    );
}

export function Toast({
    message,
    tone,
    animation,
    onClose,
}: {
    message: string;
    tone: 'success' | 'error' | 'info';
    animation: SpringValues<{ opacity: number; transform: string }>;
    onClose: () => void;
}) {
    useEffect(() => {
        const timer = window.setTimeout(onClose, 3600);
        return () => window.clearTimeout(timer);
    }, [onClose]);

    return (
        <animated.div className={css('toast', `toast--${tone}`)} style={animation} role="status">
            <Icon name={tone === 'success' ? 'check' : tone === 'error' ? 'close' : 'bell'} />
            <span>{message}</span>
            <IconButton icon="close" label="알림 닫기" onClick={onClose} />
        </animated.div>
    );
}
