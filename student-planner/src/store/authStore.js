import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,

      register: (name, email, password) => {
        const { users } = get()
        const exists = users.find(u => u.email === email)
        if (exists) {
          set({ error: 'An account with this email already exists.' })
          return false
        }
        const newUser = {
          id: crypto.randomUUID(),
          name,
          email,
          password,
          createdAt: new Date().toISOString(),
          avatar: name.charAt(0).toUpperCase(),
        }
        set(state => ({
          users: [...state.users, newUser],
          user: { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar },
          isAuthenticated: true,
          error: null,
        }))
        return true
      },

      login: (email, password) => {
        const { users } = get()
        const found = users.find(u => u.email === email && u.password === password)
        if (!found) {
          set({ error: 'Invalid email or password.' })
          return false
        }
        set({
          user: { id: found.id, name: found.name, email: found.email, avatar: found.avatar },
          isAuthenticated: true,
          error: null,
        })
        return true
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'student-planner-auth',
      partialize: state => ({ users: state.users, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

export default useAuthStore
