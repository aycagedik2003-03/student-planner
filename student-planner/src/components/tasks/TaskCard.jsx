import { Trash2, Clock, Tag, Calendar } from 'lucide-react'
import { TYPE_COLORS, PRIORITY_COLORS } from '../../utils/constants'
import { formatDate, getDueDateLabel } from '../../utils/dateUtils'
import { useTasks } from '../../hooks/useTasks'

const TaskCard = ({ task, onEdit }) => {
  const { toggleTask, deleteTask } = useTasks()

  const typeColor = TYPE_COLORS[task.type] || TYPE_COLORS.other
  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium
  const dueLabel = getDueDateLabel(task.dueDate)
  const isCompleted = task.status === 'completed'

  return (
    <div
      className={`
        group bg-white dark:bg-gray-800 rounded-xl border p-4 shadow-sm
        transition-all duration-200 hover:shadow-md
        ${isCompleted
          ? 'border-gray-100 dark:border-gray-700 opacity-70'
          : 'border-gray-200 dark:border-gray-700'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => toggleTask(task.id)}
          className={`
            mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center
            transition-all duration-150
            ${isCompleted
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 dark:border-gray-500 hover:border-blue-500'
            }
          `}
          aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        >
          {isCompleted && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => onEdit && onEdit(task)}
              className="text-left"
            >
              <h3
                className={`text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                  isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : ''
                }`}
              >
                {task.title}
              </h3>
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="shrink-0 p-1 rounded text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Delete task"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {task.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* Type badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeColor.bg} ${typeColor.text}`}>
              {task.type.replace('_', ' ')}
            </span>

            {/* Priority */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor.bg} ${priorityColor.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityColor.dot}`} />
              {task.priority}
            </span>

            {/* Category */}
            {task.category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700">
                <Tag size={10} />
                {task.category}
              </span>
            )}

            {/* Estimated hours */}
            {task.estimatedHours && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Clock size={10} />
                {task.estimatedHours}h
              </span>
            )}
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div className="flex items-center gap-1 mt-2">
              <Calendar size={11} className={`${dueLabel?.overdue ? 'text-red-500' : dueLabel?.urgent ? 'text-orange-500' : 'text-gray-400'}`} />
              <span
                className={`text-xs ${
                  dueLabel?.overdue
                    ? 'text-red-500 dark:text-red-400 font-medium'
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
