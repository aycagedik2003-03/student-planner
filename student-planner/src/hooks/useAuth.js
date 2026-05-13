import useAuthStore from '../store/authStore'

export const useAuth = () => {
  const user = useAuthStore(s => s.user)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const error = useAuthStore(s => s.error)
  const register = useAuthStore(s => s.register)
  const login = useAuthStore(s => s.login)
  const logout = useAuthStore(s => s.logout)
  const clearError = useAuthStore(s => s.clearError)

  return { user, isAuthenticated, error, register, login, logout, clearError }
}
