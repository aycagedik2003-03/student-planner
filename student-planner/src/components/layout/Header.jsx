import { useState } from 'react'
import { Search, Bell, X } from 'lucide-react'
import useTasksStore from '../../store/tasksStore'
import { useAuth } from '../../hooks/useAuth'

const Header = ({ title }) => {
  const setSearchQuery = useTasksStore(s => s.setSearchQuery)
  const searchQuery = useTasksStore(s => s.searchQuery)
  const { user } = useAuth()
  const [showNotif, setShowNotif] = useState(false)

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3.5 flex items-center gap-4">
      <h1 className="text-base font-semibold text-gray-900 dark:text-white shrink-0">{title}</h1>

      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-7 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600 border border-gray-100 dark:border-gray-700 focus:border-violet-300 dark:focus:border-violet-600 focus:bg-white dark:focus:bg-gray-700 rounded-lg outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(p => !p)}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={17} />
          </button>
          {showNotif && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotif(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg p-4 z-20">
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Notifications</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">No new notifications.</p>
              </div>
            </>
          )}
        </div>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-default"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          title={user?.name}
        >
          {user?.avatar}
        </div>
      </div>
    </header>
  )
}

export default Header
