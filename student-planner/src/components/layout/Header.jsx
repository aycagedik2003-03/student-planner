import { useState } from 'react'
import { Search, Bell, X, Moon, Sun, Menu } from 'lucide-react'
import useTasksStore from '../../store/tasksStore'
import { useAuth }     from '../../hooks/useAuth'
import { useDarkMode } from '../../hooks/useDarkMode'

/* onMenuClick → opens mobile sidebar drawer */
const Header = ({ title, onMenuClick }) => {
  const setSearchQuery = useTasksStore(s => s.setSearchQuery)
  const searchQuery    = useTasksStore(s => s.searchQuery)
  const { user }       = useAuth()
  const { darkMode, toggleDarkMode } = useDarkMode()
  const [showNotif, setShowNotif] = useState(false)

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 h-14 sm:h-16">

        {/* ── Hamburger (mobile only) ── */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-1 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        {/* ── Page title ── */}
        <h1 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white shrink-0">
          {title}
        </h1>

        {/* ── Search bar — hidden on mobile, visible md+ ── */}
        <div className="hidden md:flex flex-1 max-w-sm relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-gray-200 dark:border-gray-700 focus:border-violet-400 dark:focus:border-violet-500 focus:bg-white dark:focus:bg-gray-800 rounded-lg outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-1 ml-auto">

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className={[
              'hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border',
              darkMode
                ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200',
            ].join(' ')}
          >
            {darkMode ? <><Sun size={12} /> Light</> : <><Moon size={12} /> Dark</>}
          </button>

          {/* Dark mode — icon-only on xs */}
          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="sm:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(p => !p)}
              className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Notifications"
            >
              <Bell size={17} />
            </button>

            {showNotif && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotif(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl p-4 z-20">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Notifications</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">
                    No new notifications.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-default select-none"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
            title={user?.name}
          >
            {user?.avatar}
          </div>
        </div>
      </div>

      {/* ── Mobile search bar (below header row) ── */}
      <div className="md:hidden px-3 sm:px-4 pb-2.5">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-gray-200 dark:border-gray-700 focus:border-violet-400 dark:focus:border-violet-500 focus:bg-white dark:focus:bg-gray-800 rounded-xl outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
