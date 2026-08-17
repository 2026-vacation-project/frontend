import type { SVGProps } from 'react'

export type IconName =
  | 'arrow'
  | 'bell'
  | 'check'
  | 'chevron'
  | 'close'
  | 'game'
  | 'group'
  | 'home'
  | 'menu'
  | 'plus'
  | 'search'
  | 'settings'
  | 'sport'
  | 'user'

const paths: Record<IconName, React.ReactNode> = {
  arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
  game: <><path d="M6 10h12a4 4 0 0 1 3.6 5.7l-1.3 2.6a2 2 0 0 1-3.1.6L14.5 17h-5l-2.7 1.9a2 2 0 0 1-3.1-.6l-1.3-2.6A4 4 0 0 1 6 10Z"/><path d="M8 13v4M6 15h4M17 14h.01M19 16h.01"/><path d="M8 10 9 7h6l1 3"/></>,
  group: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.2.37.3.76.3 1.2H21v4h-.1c-.44 0-.83.1-1.5.8Z"/></>,
  sport: <><circle cx="12" cy="12" r="9"/><path d="m8 4 4 3 4-3M4 10l4 2-1 5M20 10l-4 2 1 5M9 21l3-4 3 4"/><path d="m8 12 4-5 4 5-1 5H9Z"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
}

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {paths[name]}
    </svg>
  )
}
