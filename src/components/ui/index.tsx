import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { animated, type SpringValues, useTransition } from '@react-spring/web';
import { createPortal } from 'react-dom';
import { css } from '../../appStyles';
import { Icon, type IconName } from './Icon';
import { initials } from '../../utils/format';
import { useSkipRouteTransitionForLoading } from './routeTransition';

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
    useSkipRouteTransitionForLoading();

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

export interface DropdownOption {
    value: string;
    label: string;
    description?: string;
    color?: string;
    disabled?: boolean;
}

export function Dropdown({
    options,
    value,
    onChange,
    placeholder = '선택해 주세요',
    ariaLabel,
    multiple = false,
    disabled = false,
    emptyMessage = '선택할 항목이 없습니다.',
}: {
    options: DropdownOption[];
    value: string | string[];
    onChange: (value: string | string[]) => void;
    placeholder?: string;
    ariaLabel: string;
    multiple?: boolean;
    disabled?: boolean;
    emptyMessage?: string;
}) {
    const id = useId();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [position, setPosition] = useState<{
        left: number;
        top?: number;
        bottom?: number;
        width: number;
        maxHeight: number;
    } | null>(null);
    const selectedValues = multiple
        ? new Set(Array.isArray(value) ? value : [])
        : new Set(typeof value === 'string' && value ? [value] : []);
    const selectedOptions = options.filter((option) => selectedValues.has(option.value));
    const triggerText = !selectedOptions.length
        ? placeholder
        : multiple && selectedOptions.length > 1
          ? `${selectedOptions[0].label} 외 ${selectedOptions.length - 1}개`
          : selectedOptions[0].label;

    const updatePosition = useCallback(() => {
        const trigger = triggerRef.current;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        const viewportMargin = 8;
        const gap = 6;
        const menuWidth = Math.min(Math.max(rect.width, 240), window.innerWidth - viewportMargin * 2);
        const left = Math.min(
            Math.max(viewportMargin, rect.left),
            Math.max(viewportMargin, window.innerWidth - menuWidth - viewportMargin),
        );
        const roomBelow = window.innerHeight - rect.bottom - gap - viewportMargin;
        const roomAbove = rect.top - gap - viewportMargin;
        const openAbove = roomBelow < 192 && roomAbove > roomBelow;
        const maxHeight = Math.max(120, Math.min(320, openAbove ? roomAbove : roomBelow));
        setPosition({
            left,
            width: menuWidth,
            maxHeight,
            ...(openAbove ? { bottom: window.innerHeight - rect.top + gap } : { top: rect.bottom + gap }),
        });
    }, []);

    useLayoutEffect(() => {
        if (!open) return;
        updatePosition();
    }, [open, options, updatePosition]);

    useEffect(() => {
        if (!open) return;
        const closeOnOutsideClick = (event: PointerEvent) => {
            const target = event.target as Node;
            if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
        };
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        document.addEventListener('pointerdown', closeOnOutsideClick);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
            document.removeEventListener('pointerdown', closeOnOutsideClick);
        };
    }, [open, updatePosition]);

    function choose(option: DropdownOption) {
        if (option.disabled) return;
        if (multiple) {
            const next = new Set(selectedValues);
            if (next.has(option.value)) next.delete(option.value);
            else next.add(option.value);
            onChange([...next]);
            return;
        }
        onChange(option.value);
        setOpen(false);
        triggerRef.current?.focus();
    }

    function openMenu() {
        const selectedIndex = options.findIndex((option) => selectedValues.has(option.value) && !option.disabled);
        setActiveIndex(
            selectedIndex >= 0
                ? selectedIndex
                : Math.max(
                      0,
                      options.findIndex((option) => !option.disabled),
                  ),
        );
        setOpen(true);
    }

    function moveActive(direction: 1 | -1) {
        if (!options.length) return;
        let next = activeIndex;
        for (let count = 0; count < options.length; count += 1) {
            next = (next + direction + options.length) % options.length;
            if (!options[next].disabled) break;
        }
        setActiveIndex(next);
        window.requestAnimationFrame(() => {
            menuRef.current
                ?.querySelector<HTMLElement>(`[data-option-index="${next}"]`)
                ?.scrollIntoView({ block: 'nearest' });
        });
    }

    function handleKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'Tab') {
            setOpen(false);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
            triggerRef.current?.focus();
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) openMenu();
            else moveActive(event.key === 'ArrowDown' ? 1 : -1);
        } else if ((event.key === 'Enter' || event.key === ' ') && open && options[activeIndex]) {
            event.preventDefault();
            choose(options[activeIndex]);
        } else if (event.key === 'Home' && open) {
            event.preventDefault();
            setActiveIndex(
                Math.max(
                    0,
                    options.findIndex((option) => !option.disabled),
                ),
            );
        } else if (event.key === 'End' && open) {
            event.preventDefault();
            const lastEnabled = options.map((option) => !option.disabled).lastIndexOf(true);
            setActiveIndex(Math.max(0, lastEnabled));
        }
    }

    return (
        <div className={css('dropdown')}>
            <button
                ref={triggerRef}
                type="button"
                className={css('dropdown__trigger', open && 'is-open', !selectedOptions.length && 'is-placeholder')}
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={`${id}-listbox`}
                aria-activedescendant={open && options[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
                disabled={disabled}
                onClick={() => (open ? setOpen(false) : openMenu())}
                onKeyDown={handleKeyDown}
            >
                <span>{triggerText}</span>
                <Icon name="chevron" />
            </button>
            {open &&
                position &&
                createPortal(
                    <div
                        ref={menuRef}
                        className={css('dropdown__menu')}
                        id={`${id}-listbox`}
                        role="listbox"
                        aria-label={ariaLabel}
                        aria-multiselectable={multiple || undefined}
                        tabIndex={-1}
                        style={position}
                        onKeyDown={handleKeyDown}
                    >
                        {options.length ? (
                            options.map((option, index) => {
                                const selected = selectedValues.has(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        id={`${id}-option-${index}`}
                                        type="button"
                                        className={css('dropdown__option', index === activeIndex && 'is-active')}
                                        role="option"
                                        aria-selected={selected}
                                        disabled={option.disabled}
                                        tabIndex={-1}
                                        data-option-index={index}
                                        onMouseMove={() => !option.disabled && setActiveIndex(index)}
                                        onClick={() => choose(option)}
                                    >
                                        {option.color && (
                                            <span
                                                className={css('dropdown__swatch')}
                                                style={{ backgroundColor: option.color }}
                                                aria-hidden="true"
                                            />
                                        )}
                                        <span className={css('dropdown__option-copy')}>
                                            <strong>{option.label}</strong>
                                            {option.description && <small>{option.description}</small>}
                                        </span>
                                        {selected && <Icon name="check" className={css('dropdown__check')} />}
                                    </button>
                                );
                            })
                        ) : (
                            <p className={css('dropdown__empty')}>{emptyMessage}</p>
                        )}
                    </div>,
                    document.body,
                )}
        </div>
    );
}

export function Dialog({
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
    const titleId = useId();
    const dialogRef = useRef<HTMLElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const transitions = useTransition(open, {
        from: { opacity: 0, transform: 'translateY(8px)' },
        enter: { opacity: 1, transform: 'translateY(0px)' },
        leave: { opacity: 0, transform: 'translateY(8px)' },
        config: { tension: 300, friction: 28 },
    });

    useEffect(() => {
        if (!open) return;
        previousFocusRef.current = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        const previousPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
        window.requestAnimationFrame(() => {
            const focusTarget =
                dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]') ??
                dialogRef.current?.querySelector<HTMLElement>(
                    'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
                );
            focusTarget?.focus();
        });
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }
            if (event.key !== 'Tab' || !dialogRef.current) return;
            const focusable = Array.from(
                dialogRef.current.querySelectorAll<HTMLElement>(
                    'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
                ),
            );
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight = previousPaddingRight;
            previousFocusRef.current?.focus();
        };
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
                        ref={dialogRef}
                        className={css('modal')}
                        style={{ transform: styles.transform }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                    >
                        <header>
                            <h2 id={titleId}>{title}</h2>
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

export const Modal = Dialog;

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
