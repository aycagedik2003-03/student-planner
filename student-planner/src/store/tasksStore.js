import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isPast, isWithinInterval, addDays, startOfDay, parseISO } from 'date-fns'

const useTasksStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      filter: 'all',
      sortBy: 'dueDate',
      searchQuery: '',

      addTask: task => {
        const newTask = {
          id: crypto.randomUUID(),
          title: task.title,
          description: task.description || '',
          type: task.type || 'other',
          priority: task.priority || 'medium',
          status: task.status || 'pending',
          dueDate: task.dueDate || null,
          estimatedHours: task.estimatedHours || null,
          category: task.category || '',
          userId: task.userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: null,
        }
        set(state => ({ tasks: [...state.tasks, newTask] }))
        return newTask
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        }))
      },

      deleteTask: id => {
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }))
      },

      toggleTask: id => {
        const { tasks } = get()
        const task = tasks.find(t => t.id === id)
        if (!task) return
        const newStatus = task.status === 'completed' ? 'pending' : 'completed'
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id
              ? {
                  ...t,
                  status: newStatus,
                  completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }))
      },

      setFilter: filter => set({ filter }),
      setSortBy: sortBy => set({ sortBy }),
      setSearchQuery: query => set({ searchQuery: query }),

      getUserTasks: userId => {
        const { tasks, filter, sortBy, searchQuery } = get()
        let filtered = tasks.filter(t => t.userId === userId)

        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          filtered = filtered.filter(
            t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
          )
        }

        if (filter === 'pending') filtered = filtered.filter(t => t.status !== 'completed')
        else if (filter === 'completed') filtered = filtered.filter(t => t.status === 'completed')
        else if (filter === 'overdue') {
          filtered = filtered.filter(
            t => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'completed'
          )
        }

        filtered.sort((a, b) => {
          if (sortBy === 'dueDate') {
            if (!a.dueDate) return 1
            if (!b.dueDate) return -1
            return new Date(a.dueDate) - new Date(b.dueDate)
          }
          if (sortBy === 'priority') {
            const order = { high: 0, medium: 1, low: 2 }
            return order[a.priority] - order[b.priority]
          }
          if (sortBy === 'title') return a.title.localeCompare(b.title)
          if (sortBy === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt)
          return 0
        })

        return filtered
      },

      getStats: userId => {
        const { tasks } = get()
        const userTasks = tasks.filter(t => t.userId === userId)
        const total = userTasks.length
        const completed = userTasks.filter(t => t.status === 'completed').length
        const pending = userTasks.filter(t => t.status !== 'completed').length
        const overdue = userTasks.filter(
          t => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'completed'
        ).length
        return { total, completed, pending, overdue }
      },

      getUpcoming: userId => {
        const { tasks } = get()
        const now = startOfDay(new Date())
        const in7 = addDays(now, 7)
        return tasks
          .filter(t => {
            if (t.userId !== userId || t.status === 'completed' || !t.dueDate) return false
            try {
              const due = parseISO(t.dueDate)
              return isWithinInterval(due, { start: now, end: in7 })
            } catch {
              return false
            }
          })
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5)
      },

      getOverdue: userId => {
        const { tasks } = get()
        return tasks.filter(
          t => t.userId === userId && t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'completed'
        )
      },
    }),
    {
      name: 'student-planner-tasks',
      partialize: state => ({ tasks: state.tasks }),
    }
  )
)

export default useTasksStore
