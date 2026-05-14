import { useState } from 'react'
import { Plus, ArrowUpDown, SlidersHorizontal } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { SORT_OPTIONS } from '../utils/constants'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import Modal    from '../components/common/Modal'

const FILTERS = [
  { value: 'all',       label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'completed', label: 'Done' },
  { value: 'overdue',   label: 'Overdue' },
]

const TasksPage = () => {
  const { tasks, filter, sortBy, setFilter, setSortBy, stats } = useTasks()
  const [showForm,    setShowForm]    = useState(false)
  const [editTask,    setEditTask]    = useState(null)
  const [showSortMenu, setShowSortMenu] = useState(false)

  return (
    <div className="flex flex-col gap-4 sm:gap-5 max-w-4xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">My Tasks</h2>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {stats.total} total · {stats.pending} pending
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white hover:opacity-90 shrink-0"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
        >
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* ── Filters + Sort ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filter tabs — scrollable row on mobile */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-0.5 sm:gap-1 overflow-x-auto scrollbar-thin">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={[
                'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap',
                filter === f.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
              ].join(' ')}
            >
              {f.label}
              {f.value === 'overdue' && stats.overdue > 0 && (
                <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">
                  {stats.overdue}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowSortMenu(p => !p)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 whitespace-nowrap"
          >
            <ArrowUpDown size={12} />
            <span className="hidden sm:inline">{SORT_OPTIONS.find(s => s.value === sortBy)?.label}</span>
            <span className="sm:hidden">Sort</span>
          </button>
          {showSortMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 z-20">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSortMenu(false) }}
                    className={[
                      'w-full text-left px-4 py-2.5 sm:py-2 text-sm',
                      sortBy === opt.value
                        ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Task list ── */}
      <div className="flex flex-col gap-2.5 sm:gap-3">
        {tasks.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
              <SlidersHorizontal size={20} className="text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">
              {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
            </p>
            {filter === 'all' && (
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                Tap &ldquo;Add Task&rdquo; to get started
              </p>
            )}
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
