import { useState } from 'react'
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react'
import useTasksStore from '../store/tasksStore'
import { useAuth }   from '../hooks/useAuth'
import TaskCard  from '../components/tasks/TaskCard'
import TaskForm  from '../components/tasks/TaskForm'
import Modal     from '../components/common/Modal'

const SchedulePage = () => {
  const { user } = useAuth()
  const getUserTasks = useTasksStore(s => s.getUserTasks)
  const allTasks     = user ? getUserTasks(user.id) : []

  const [weekStart,   setWeekStart]   = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [showForm,    setShowForm]    = useState(false)
  const [editTask,    setEditTask]    = useState(null)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const tasksForDay = day =>
    allTasks.filter(t => {
      if (!t.dueDate) return false
      try { return isSameDay(parseISO(t.dueDate), day) }
      catch { return false }
    })

  const selectedDayTasks = tasksForDay(selectedDay)

  return (
    <div className="flex flex-col gap-4 sm:gap-5 max-w-5xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Weekly Schedule</h2>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setWeekStart(d => addDays(d, -7))}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
            aria-label="Previous week"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Date range — compact on mobile */}
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px] sm:min-w-[160px] text-center">
            <span className="hidden sm:inline">
              {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <span className="sm:hidden">
              {format(weekStart, 'MMM d')}–{format(addDays(weekStart, 6), 'd')}
            </span>
          </span>

          <button
            onClick={() => setWeekStart(d => addDays(d, 7))}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
            aria-label="Next week"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-white hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* ── Week grid — horizontally scrollable on small screens ──
          Negative margins + matching padding expand the scroll area edge-to-edge
          while keeping content aligned with the rest of the page.          */}
      <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[320px] px-3 sm:px-4 md:px-0 pb-1">
          {days.map(day => {
            const dayTasks   = tasksForDay(day)
            const isSelected = isSameDay(day, selectedDay)
            const isToday    = isSameDay(day, new Date())

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                className={[
                  'flex flex-col items-center rounded-xl sm:rounded-2xl p-2 sm:p-3 border',
                  isSelected
                    ? 'text-white shadow-md border-transparent'
                    : isToday
                    ? 'border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                ].join(' ')}
                style={isSelected ? { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' } : {}}
              >
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide opacity-70">
                  {format(day, 'EEE')}
                </span>
                <span className="text-base sm:text-lg font-bold mt-0.5">{format(day, 'd')}</span>
                {dayTasks.length > 0 && (
                  <div className={`flex gap-0.5 mt-1 ${isSelected ? 'opacity-60' : ''}`}>
                    {dayTasks.slice(0, 3).map((_, i) => (
                      <span
                        key={i}
                        className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-violet-500'}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Day detail ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              {format(selectedDay, 'EEEE, MMMM d')}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          {isSameDay(selectedDay, new Date()) && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
              Today
            </span>
          )}
        </div>

        <div className="p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3">
          {selectedDayTasks.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <Calendar size={28} className="text-gray-200 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-400 dark:text-gray-500">No tasks scheduled for this day</p>
            </div>
          ) : (
            selectedDayTasks.map(task => (
              <TaskCard key={task.id} task={task} onEdit={t => setEditTask(t)} />
            ))
          )}
        </div>
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

export default SchedulePage
