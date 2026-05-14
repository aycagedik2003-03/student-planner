import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Settings, CheckSquare, BookOpen,
  ChevronLeft, ChevronRight, LogOut, Moon, Sun, X,
} from 'lucide-react'
import { useAuth }      from '../../hooks/useAuth'
import { useDarkMode }  from '../../hooks/useDarkMode'
import useSettingsStore from '../../store/settingsStore'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks',     label: 'Tasks',     icon: CheckSquare },
  { path: '/exams',     label: 'Exams',     icon: BookOpen },
  { path: '/schedule',  label: 'Calendar',  icon: Calendar },
  { path: '/settings',  label: 'Settings',  icon: Settings },
]

/* ─────────────────────────────────────────────────────────────────────────────
   Mobile  (<md): fixed overlay that slides in/out with translate.
   Desktop (≥md): sticky in-flow sidebar, collapses to icon-only via width.

   Key: `md:relative` overrides `fixed`, `md:translate-x-0` overrides any
   mobile translate, so desktop layout is completely unaffected by mobileOpen.
───────────────────────────────────────────────────────────────────────────── */
const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout }        = useAuth()
  const { darkMode, toggleDarkMode } = useDarkMode()
  const collapsed    = useSettingsStore(s => s.sidebarCollapsed)
  const toggleSidebar = useSettingsStore(s => s.toggleSidebar)

  const handleLogout = () => { logout(); onClose() }

  return (
    <>
      {/* ── Mobile backdrop ── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          'fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden',
          'transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* ── Sidebar panel ── */}
      <aside
        className={[
          'flex flex-col h-screen z-30 shrink-0',
          'bg-white dark:bg-gray-900',
          'border-r border-gray-100 dark:border-gray-800',

          // Mobile: fixed overlay, slide in/out
          'fixed inset-y-0 left-0 w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'transition-transform duration-300 ease-in-out',

          // Desktop: override to in-flow sticky, reset transform/width
          'md:relative md:inset-y-auto md:left-auto',
          'md:translate-x-0 md:transition-none',
          collapsed ? 'md:w-16' : 'md:w-56',
        ].join(' ')}
        /* Width-only transition on desktop — doesn't fight with transform on mobile */
        style={{ '--tw-sidebar': 'ok' }}
      >
        {/* ── Logo row ── */}
        <div
          className={[
            'flex items-center gap-2.5 px-4 min-h-[64px] py-4',
            collapsed ? 'md:justify-center' : '',
          ].join(' ')}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-sm select-none"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
          >
            S
          </div>

          {/* Label: always visible on mobile, hidden when desktop-collapsed */}
          <span
            className={[
              'font-bold text-gray-900 dark:text-white text-base tracking-tight truncate flex-1',
              collapsed ? 'md:hidden' : '',
            ].join(' ')}
          >
            StudyPlanner
          </span>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="md:hidden ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Nav links ── */}
        <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto scrollbar-thin">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}           /* closes drawer on mobile; no-op on desktop */
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-3 py-3 md:py-2.5 text-sm font-medium',
                  isActive
                    ? 'text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
                  collapsed ? 'md:justify-center' : '',
                ].join(' ')
              }
              style={({ isActive }) =>
                isActive ? { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' } : {}
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={20} className="shrink-0" />
              <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom section ── */}
        <div className="px-2 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-0.5">
          {/* User info pill */}
          {user && (
            <div
              className={[
                'flex items-center gap-2.5 px-3 py-2.5 mb-1 rounded-xl bg-gray-50 dark:bg-gray-800/80',
                collapsed ? 'md:hidden' : '',
              ].join(' ')}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
              >
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Dark mode */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
            className={[
              'flex items-center gap-3 w-full rounded-xl px-3 py-3 md:py-2.5 text-sm font-medium',
              'text-gray-500 dark:text-gray-400',
              'hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
              collapsed ? 'md:justify-center' : '',
            ].join(' ')}
          >
            {darkMode
              ? <Sun  size={18} className="shrink-0 text-amber-400" />
              : <Moon size={18} className="shrink-0" />
            }
            <span className={collapsed ? 'md:hidden' : ''}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Logout"
            className={[
              'flex items-center gap-3 w-full rounded-xl px-3 py-3 md:py-2.5 text-sm font-medium',
              'text-gray-500 dark:text-gray-400',
              'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400',
              collapsed ? 'md:justify-center' : '',
            ].join(' ')}
          >
            <LogOut size={18} className="shrink-0" />
            <span className={collapsed ? 'md:hidden' : ''}>Logout</span>
          </button>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={toggleSidebar}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={[
              'hidden md:flex items-center gap-2 w-full rounded-xl px-3 py-2 text-xs mt-1',
              'text-gray-300 dark:text-gray-600',
              'hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-500 dark:hover:text-gray-400',
              collapsed ? 'justify-center' : '',
            ].join(' ')}
          >
            {collapsed
              ? <ChevronRight size={14} />
              : <><ChevronLeft size={14} /><span>Collapse</span></>
            }
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
