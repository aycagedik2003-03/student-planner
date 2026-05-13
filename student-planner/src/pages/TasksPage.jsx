import { useState } from 'react'
import { Plus, Filter, ArrowUpDown, SlidersHorizontal } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { SORT_OPTIONS } from '../utils/constants'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
]

const TasksPage = () => {
  const { tasks, filter, sortBy, setFilter, setSortBy, stats } = useTasks()
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [showSortMenu, setShowSortMenu] = useState(false)

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Tasks</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{stats.total} total · {stats.pending} pending</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Task
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === f.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowSortMenu(p => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowUpDown size={14} />
            Sort: {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-10">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setShowSortMenu(false) }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    sortBy === opt.value
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <SlidersHorizontal size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {filter === 'all' && 'Click "Add Task" to get started'}
            </p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={t => setEditTask(t)} />
          ))
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Task" size="lg">
        <TaskForm onClose={() => setShowForm(false)} />
      </Modal>

      <Modal isOpen={Boolean(editTask)} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        {editTask && <TaskForm task={editTask} onClose={() => setEditTask(null)} />}
      </Modal>
    </div>
  )
}

export default TasksPage
