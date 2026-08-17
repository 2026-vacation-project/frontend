import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { Icon, type IconName } from './Icon'
import { initials } from '../../utils/format'

export function Button({
  children,
  tone = 'primary',
  icon,
  loading = false,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'primary' | 'secondary' | 'quiet' | 'danger'
  icon?: IconName
  loading?: boolean
}) {
  return (
    <button className={`button button--${tone} ${className}`} disabled={loading || props.disabled} {...props}>
      {icon && <Icon name={icon} className="button__icon" />}
      <span>{loading ? '처리 중…' : children}</span>
    </button>
  )
}

export function IconButton({ label, icon, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; icon: IconName }) {
  return <button className="icon-button" aria-label={label} title={label} {...props}><Icon name={icon} /></button>
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {error ? <span className="field__error">{error}</span> : hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  )
}

export function SearchInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  const accessibleLabel = props['aria-label'] ?? props.placeholder ?? '검색'
  return (
    <label className="search-input" htmlFor={id}>
      <Icon name="search" />
      <input {...props} id={id} type="search" aria-label={accessibleLabel} />
    </label>
  )
}

export function Avatar({ name, src, size = 'md' }: { name: string; src?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  return src ? <img className={`avatar avatar--${size}`} src={src} alt={`${name} 프로필`} /> : <span className={`avatar avatar--${size}`} aria-label={`${name} 프로필`}>{initials(name)}</span>
}

export function RoleBadge({ name, color }: { name: string; color: string }) {
  return <span className="role-label"><span className="role-label__dot" style={{ backgroundColor: color }} />{name}</span>
}

export function StatusLabel({ status }: { status: 'RECRUITING' | 'COMPLETED' | 'CANCELLED' }) {
  const labels = { RECRUITING: '모집 중', COMPLETED: '모집 완료', CANCELLED: '취소됨' }
  return <span className={`status status--${status.toLowerCase()}`}><span aria-hidden="true" />{labels[status]}</span>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="empty-state"><div className="empty-state__mark" aria-hidden="true"><span /><span /><span /></div><h2>{title}</h2><p>{description}</p>{action}</div>
}

export function LoadingRows({ count = 4 }: { count?: number }) {
  return <div className="loading-rows" aria-label="목록 불러오는 중" aria-busy="true">{Array.from({ length: count }, (_, index) => <div className="skeleton-row" key={index}><span /><span /><span /></div>)}</div>
}

export function InlineNotice({ tone = 'info', title, children }: { tone?: 'info' | 'error' | 'warning'; title: string; children: React.ReactNode }) {
  return <div className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}><strong>{title}</strong><p>{children}</p></div>
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header><h2 id="modal-title">{title}</h2><IconButton icon="close" label="닫기" onClick={onClose} /></header>
        {children}
      </section>
    </div>,
    document.body,
  )
}

export function Toast({ message, tone, onClose }: { message: string; tone: 'success' | 'error' | 'info'; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3600)
    return () => window.clearTimeout(timer)
  }, [onClose])

  return <div className={`toast toast--${tone}`} role="status"><Icon name={tone === 'success' ? 'check' : tone === 'error' ? 'close' : 'bell'} /><span>{message}</span><IconButton icon="close" label="알림 닫기" onClick={onClose} /></div>
}
