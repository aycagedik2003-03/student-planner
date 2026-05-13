import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSettingsStore = create(
  persist(
    (set) => ({
      darkMode: false,
      sidebarCollapsed: false,
      notificationsEnabled: true,

      toggleDarkMode: () =>
        set(state => {
          const next = !state.darkMode
          if (next) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return { darkMode: next }
        }),

      setSidebarCollapsed: val => set({ sidebarCollapsed: val }),
      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleNotifications: () => set(state => ({ notificationsEnabled: !state.notificationsEnabled })),

      initDarkMode: () => {
        const stored = JSON.parse(localStorage.getItem('student-planner-settings') || '{}')
        if (stored?.state?.darkMode) {
          document.documentElement.classList.add('dark')
        }
      },
    }),
    {
      name: 'student-planner-settings',
    }
  )
)

export default useSettingsStore
