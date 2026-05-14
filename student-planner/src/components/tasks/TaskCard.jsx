import { Trash2, Clock, Tag, Calendar } from 'lucide-react'
import { TYPE_COLORS, PRIORITY_COLORS } from '../../utils/constants'
import { formatDate, getDueDateLabel } from '../../utils/dateUtils'
import { useTasks } from '../../hooks/useTasks'

const TaskCard = ({ task, onEdit }) => {
  const { toggleTask, deleteTask } = useTasks()
  const typeColor     = TYPE_COLORS[task.type]     || TYPE_COLORS.other
  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium
  const dueLabel      = getDueDateLabel(task.dueDate)
  const isCompleted   = task.status === 'completed'

  return (
    <div
      className={`
        group relative bg-white dark:bg-gray-800
        rounded-xl border shadow-sm hover:shadow-md
        ${isCompleted
          ? 'border-gray-100 dark:border-gray-700/60 opacity-75'
          : 'border-gray-200 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-800'
        }
      `}
    >
      {/* Accent stripe */}
      {!isCompleted && (
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
          style={{
            background: task.priority === 'high'
              ? 'linear-gradient(180deg,#ef4444,#dc2626)'
              : task.priority === 'medium'
              ? 'linear-gradient(180deg,#f59e0b,#d97706)'
              : 'linear-gradient(180deg,#10b981,#059669)',
          }}
        />
      )}

      <div className="flex items-start gap-3 p-4 pl-5">
        {/* Checkbox */}
        <button
          onClick={() => toggleTask(task.id)}
          className={`
            mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center
            ${isCompleted
              ? 'border-violet-500 bg-violet-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-violet-500 dark:hover:border-violet-400'
            }
          `}
          aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        >
          {isCompleted && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <button onClick={() => onEdit && onEdit(task)} className="text-left flex-1 min-w-0">
              <h3
                className={`text-sm font-semibold leading-snug
                  ${isCompleted
                    ? 'line-through text-gray-400 dark:text-gray-500'
                    : 'text-gray-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400'
                  }`}
              >
                {task.title}
              </h3>
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="shrink-0 p-1 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100"
              aria-label="Delete task"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {task.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {/* Type badge */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeColor.bg} ${typeColor.text}`}>
              {task.type.replace('_', ' ')}
            </span>

            {/* Priority badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor.bg} ${priorityColor.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityColor.dot}`} />
              {task.priority}
            </span>

            {/* Category */}
            {task.category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700">
                <Tag size={9} />
                {task.category}
              </span>
            )}

            {/* Hours */}
            {task.estimatedHours && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Clock size={9} />
                {task.estimatedHours}h
              </span>
            )}
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div className="flex items-center gap-1 mt-2">
              <Calendar
                size={11}
                className={dueLabel?.overdue ? 'text-red-500' : dueLabel?.urgent ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}
              />
              <span
                className={`text-xs ${
                  dueLabel?.overdue
                    ? 'text-red-500 dark:text-red-400 font-semibold'
                    : dueLabel?.urgent
                    ? 'text-orange-500 dark:text-orange-400 font-medium'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {dueLabel?.label || formatDate(task.dueDate)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard
