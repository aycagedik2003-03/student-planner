import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* Apply dark class immediately on module load to prevent FOUC */
const applyDark = (on) => {
  if (on) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

/* Read persisted value synchronously before React mounts */
const getPersistedDarkMode = () => {
  try {
    const raw = localStorage.getItem('student-planner-settings')
    return JSON.parse(raw)?.state?.darkMode ?? false
  } catch {
    return false
  }
}

/* Apply immediately — before React renders a single frame */
applyDark(getPersistedDarkMode())

const useSettingsStore = create(
  persist(
    (set) => ({
      darkMode: getPersistedDarkMode(),
      sidebarCollapsed: false,
      notificationsEnabled: true,

      toggleDarkMode: () =>
        set(state => {
          const next = !state.darkMode
          applyDark(next)
          return { darkMode: next }
        }),

      setSidebarCollapsed: val => set({ sidebarCollapsed: val }),
      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleNotifications: () => set(state => ({ notificationsEnabled: !state.notificationsEnabled })),
    }),
    { name: 'student-planner-settings' }
  )
)

export default useSettingsStore
