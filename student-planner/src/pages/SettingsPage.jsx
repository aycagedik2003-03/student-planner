import { useState } from 'react'
import { Moon, Sun, Bell, Trash2, User, Shield, Palette } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'
import { useAuth } from '../hooks/useAuth'
import useSettingsStore from '../store/settingsStore'
import useTasksStore from '../store/tasksStore'

const SettingRow = ({ icon: Icon, title, description, iconColor = 'text-gray-500 dark:text-gray-400', children }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center">
        <Icon size={16} className={iconColor} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="ml-4">{children}</div>
  </div>
)

const Toggle = ({ checked, onChange, color = 'violet' }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
      checked ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-600'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
)

const Section = ({ title, children }) => (
  <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
    <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
      <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
        {title}
      </h2>
    </div>
    <div className="px-5">{children}</div>
  </section>
)

const SettingsPage = () => {
  const { darkMode, toggleDarkMode } = useDarkMode()
  const notificationsEnabled = useSettingsStore(s => s.notificationsEnabled)
  const toggleNotifications  = useSettingsStore(s => s.toggleNotifications)
  const { user, logout } = useAuth()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDeleteData = () => {
    useTasksStore.setState({ tasks: [] })
    setConfirmDelete(false)
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      {/* Profile card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
          >
            {user?.avatar}
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-base">{user?.name}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <SettingRow
          icon={darkMode ? Moon : Sun}
          title="Dark Mode"
          description="Toggle between light and dark theme"
          iconColor={darkMode ? 'text-amber-400' : 'text-gray-500 dark:text-gray-400'}
        >
          <Toggle checked={darkMode} onChange={toggleDarkMode} />
        </SettingRow>
        <SettingRow
          icon={Palette}
          title="Theme"
          description="Violet purple accent (default)"
        >
          <div className="flex items-center gap-1.5">
            {['#7c3aed','#2563eb','#0891b2','#059669','#d97706'].map(c => (
              <button
                key={c}
                className={`w-5 h-5 rounded-full border-2 ${c === '#7c3aed' ? 'border-violet-600 scale-110' : 'border-transparent'}`}
                style={{ background: c }}
                aria-label={`Theme color ${c}`}
              />
            ))}
          </div>
        </SettingRow>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <SettingRow
          icon={Bell}
          title="In-app Notifications"
          description="Show alerts and reminders"
        >
          <Toggle checked={notificationsEnabled} onChange={toggleNotifications} />
        </SettingRow>
      </Section>

      {/* Data */}
      <Section title="Data & Storage">
        <SettingRow
          icon={Shield}
          title="Local Storage"
          description="All data is stored in your browser only"
        >
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-full">
            Private
          </span>
        </SettingRow>
        <SettingRow
          icon={Trash2}
          title="Clear All Tasks"
          description="Permanently delete all your tasks"
          iconColor="text-red-400"
        >
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteData}
                className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg"
              >
                Confirm
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg"
            >
              Clear
            </button>
          )}
        </SettingRow>
      </Section>

      {/* Account */}
      <Section title="Account">
        <SettingRow icon={User} title="Sign Out" description="Log out of your account">
          <button
            onClick={logout}
            className="text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg"
          >
            Logout
          </button>
        </SettingRow>
      </Section>

      <p className="text-xs text-center text-gray-300 dark:text-gray-700 pb-2">
        Student Planner · React + Zustand + Tailwind CSS v4
      </p>
    </div>
  )
}

export default SettingsPage
