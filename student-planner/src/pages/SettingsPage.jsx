import { useState } from 'react'
import { Moon, Sun, Bell, Trash2, User, Shield } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'
import { useAuth } from '../hooks/useAuth'
import useSettingsStore from '../store/settingsStore'
import useTasksStore from '../store/tasksStore'
import Button from '../components/common/Button'

const SettingRow = ({ icon: Icon, title, description, children }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <Icon size={16} className="text-gray-600 dark:text-gray-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
    {children}
  </div>
)

const Toggle = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
)

const SettingsPage = () => {
  const { darkMode, toggleDarkMode } = useDarkMode()
  const notificationsEnabled = useSettingsStore(s => s.notificationsEnabled)
  const toggleNotifications = useSettingsStore(s => s.toggleNotifications)
  const { user, logout } = useAuth()
  const clearTasks = useTasksStore(s => s.tasks)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDeleteData = () => {
    useTasksStore.setState({ tasks: [] })
    setConfirmDelete(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Profile */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Profile</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
              {user?.avatar}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Preferences</h2>
        </div>
        <div className="px-5">
          <SettingRow
            icon={darkMode ? Moon : Sun}
            title="Dark Mode"
            description="Toggle between light and dark theme"
          >
            <Toggle checked={darkMode} onChange={toggleDarkMode} />
          </SettingRow>
          <SettingRow
            icon={Bell}
            title="Notifications"
            description="Enable in-app notifications"
          >
            <Toggle checked={notificationsEnabled} onChange={toggleNotifications} />
          </SettingRow>
        </div>
      </section>

      {/* Data */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Data</h2>
        </div>
        <div className="px-5">
          <SettingRow
            icon={Shield}
            title="Storage"
            description="All data is stored locally in your browser"
          >
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              Local only
            </span>
          </SettingRow>
          <SettingRow
            icon={Trash2}
            title="Clear all tasks"
            description="Permanently delete all your tasks"
          >
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <Button variant="danger" size="sm" onClick={handleDeleteData}>
                  Confirm
                </Button>
              </div>
            ) : (
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                Clear
              </Button>
            )}
          </SettingRow>
        </div>
      </section>

      {/* Account */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Account</h2>
        </div>
        <div className="px-5">
          <SettingRow icon={User} title="Sign out" description="Log out of your account">
            <Button variant="secondary" size="sm" onClick={logout}>
              Logout
            </Button>
          </SettingRow>
        </div>
      </section>

      <p className="text-xs text-center text-gray-400 dark:text-gray-600 pb-4">
        Student Planner — built with React + Zustand + Tailwind CSS
      </p>
    </div>
  )
}

export default SettingsPage
