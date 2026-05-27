import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  {
    path: '/',
    label: 'Home',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21M9 21H15" />
      </svg>
    )
  },
  {
    path: '/log',
    label: 'Log Food',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        {active
          ? <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
          : <><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></>
        }
      </svg>
    )
  },
  {
    path: '/recipes',
    label: 'Recipes',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        {active
          ? <path d="M18 2H6C4.89 2 4 2.89 4 4v16l8-3 8 3V4c0-1.11-.89-2-2-2zm-2 10H8v-2h8v2zm0-4H8V6h8v2z"/>
          : <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8M8 11h5"/></>
        }
      </svg>
    )
  },
  {
    path: '/history',
    label: 'History',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        {active
          ? <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
          : <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>
        }
      </svg>
    )
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        {active
          ? <path d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.92c.04-.34.07-.68.07-1.08s-.03-.74-.07-1.08l2.31-1.84c.21-.16.27-.46.13-.7l-2.19-3.84c-.14-.24-.42-.32-.66-.24l-2.73 1.1c-.57-.44-1.18-.8-1.84-1.08L15.75 3.8c-.05-.27-.3-.47-.58-.47h-4.34c-.28 0-.52.2-.57.47L9.93 6.84C9.27 7.12 8.66 7.5 8.09 7.94L5.36 6.84c-.24-.09-.52 0-.66.24L2.51 10.92c-.14.24-.07.54.13.7l2.31 1.84c-.04.34-.07.68-.07 1.08s.03.74.07 1.08L2.64 17.46c-.21.16-.27.46-.13.7l2.19 3.84c.14.24.42.32.66.24l2.73-1.1c.57.44 1.18.8 1.84 1.08l.33 2.04c.05.27.29.47.57.47h4.34c.28 0 .52-.2.57-.47l.33-2.04c.66-.28 1.27-.64 1.84-1.08l2.73 1.1c.24.09.52 0 .66-.24l2.19-3.84c.14-.24.07-.54-.13-.7l-2.31-1.84z"/>
          : <><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>
        }
      </svg>
    )
  }
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {TABS.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            className={`nav-item${active ? ' active' : ''}`}
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            <div className="nav-pip" aria-hidden />
            {tab.icon(active)}
            <span className="nav-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
