import useTasksStore from '../store/tasksStore'
import { useAuth } from './useAuth'

export const useTasks = () => {
  const { user } = useAuth()
  const userId = user?.id

  const addTask = useTasksStore(s => s.addTask)
  const updateTask = useTasksStore(s => s.updateTask)
  const deleteTask = useTasksStore(s => s.deleteTask)
  const toggleTask = useTasksStore(s => s.toggleTask)
  const setFilter = useTasksStore(s => s.setFilter)
  const setSortBy = useTasksStore(s => s.setSortBy)
  const setSearchQuery = useTasksStore(s => s.setSearchQuery)
  const filter = useTasksStore(s => s.filter)
  const sortBy = useTasksStore(s => s.sortBy)
  const searchQuery = useTasksStore(s => s.searchQuery)
  const getUserTasks = useTasksStore(s => s.getUserTasks)
  const getStats = useTasksStore(s => s.getStats)
  const getUpcoming = useTasksStore(s => s.getUpcoming)
  const getOverdue = useTasksStore(s => s.getOverdue)

  const tasks = userId ? getUserTasks(userId) : []
  const stats = userId ? getStats(userId) : { total: 0, completed: 0, pending: 0, overdue: 0 }
  const upcomingTasks = userId ? getUpcoming(userId) : []
  const overdueTasks = userId ? getOverdue(userId) : []

  const createTask = data => {
    if (!userId) return null
    return addTask({ ...data, userId })
  }

  return {
    tasks,
    stats,
    upcomingTasks,
    overdueTasks,
    filter,
    sortBy,
    searchQuery,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    setFilter,
    setSortBy,
    setSearchQuery,
  }
}
