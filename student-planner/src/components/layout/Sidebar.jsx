import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Settings, CheckSquare, BookOpen,
  ChevronLeft, ChevronRight, LogOut, Moon, Sun,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDarkMode } from '../../hooks/useDarkMode'
import useSettingsStore from '../../store/settingsStore'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/exams', label: 'Exams', icon: BookOpen },
  { path: '/schedule', label: 'Calendar', icon: Calendar },
  { path: '/settings', label: 'Settings', icon: Settings },
]

const Sidebar = () => {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useDarkMode()
  const collapsed = useSettingsStore(s => s.sidebarCollapsed)
  const toggleSidebar = useSettingsStore(s => s.toggleSidebar)

  return (
    <aside
      className={`
        flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800
        h-screen sticky top-0 transition-all duration-300 shrink-0 z-30
        ${collapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-5 min-h-[64px] ${collapsed ? 'justify-center' : ''}`}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          S
        </div>
        {!collapsed && (
          <span className="font-bold text-gray-900 dark:text-white text-base tracking-tight">
            StudyPlanner
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              } ${collapsed ? 'justify-center' : ''}`
            }
            style={({ isActive }) =>
              isActive ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' } : {}
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-2 pb-4 flex flex-col gap-0.5">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title="Logout"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={`flex items-center gap-3 w-full rounded-xl px-3 py-2 text-xs text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mt-1 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
