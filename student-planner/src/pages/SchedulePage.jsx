import { useState } from 'react'
import { format, startOfWeek, addDays, isSameDay, parseISO, isValid } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react'
import useTasksStore from '../store/tasksStore'
import { useAuth } from '../hooks/useAuth'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'

const SchedulePage = () => {
  const { user } = useAuth()
  const getUserTasks = useTasksStore(s => s.getUserTasks)
  const allTasks = user ? getUserTasks(user.id) : []

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const tasksForDay = day =>
    allTasks.filter(t => {
      if (!t.dueDate) return false
      try {
        return isSameDay(parseISO(t.dueDate), day)
      } catch { return false }
    })

  const selectedDayTasks = tasksForDay(selectedDay)

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Schedule</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(d => addDays(d, -7))}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
            aria-label="Previous week"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[160px] text-center">
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
          <button
            onClick={() => setWeekStart(d => addDays(d, 7))}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
            aria-label="Next week"
          >
            <ChevronRight size={18} />
          </button>
          <Button onClick={() => setShowForm(true)} size="sm" className="ml-2">
            <Plus size={14} /> Add Task
          </Button>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayTasks = tasksForDay(day)
          const isSelected = isSameDay(day, selectedDay)
          const isToday = isSameDay(day, new Date())
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`
                flex flex-col items-center rounded-xl p-3 transition-all border
                ${isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : isToday
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <span className="text-xs font-medium uppercase opacity-70">{format(day, 'EEE')}</span>
              <span className="text-lg font-bold mt-0.5">{format(day, 'd')}</span>
              {dayTasks.length > 0 && (
                <div className={`flex gap-0.5 mt-1.5 ${isSelected ? 'opacity-70' : ''}`}>
                  {dayTasks.slice(0, 3).map((_, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Day detail */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {format(selectedDay, 'EEEE, MMMM d')}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{selectedDayTasks.length} tasks</p>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {selectedDayTasks.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400 dark:text-gray-500">No tasks this day</p>
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
