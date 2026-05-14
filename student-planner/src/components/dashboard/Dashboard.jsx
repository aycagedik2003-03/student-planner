import { useState } from 'react'
import {
  Plus, CheckCircle2, Clock, BookOpen, Target,
  TrendingUp, AlertCircle,
} from 'lucide-react'
import { useTasks } from '../../hooks/useTasks'
import { useAuth }  from '../../hooks/useAuth'
import TaskForm from '../tasks/TaskForm'
import Modal   from '../common/Modal'
import { PRIORITY_COLORS } from '../../utils/constants'
import { getDueDateLabel }  from '../../utils/dateUtils'

/* ── Stat card ──────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, gradient, trend }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
        style={{ background: gradient }}
      >
        <Icon size={18} className="text-white" />
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-0.5">
          <TrendingUp size={10} /> {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
)

/* ── Task row ────────────────────────────────────────────── */
const TaskRow = ({ task, onToggle }) => {
  const dueLabel    = getDueDateLabel(task.dueDate)
  const isCompleted = task.status === 'completed'
  const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 py-3 sm:py-3.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
      <button
        onClick={() => onToggle(task.id)}
        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
          isCompleted
            ? 'border-violet-500 bg-violet-500'
            : 'border-gray-300 dark:border-gray-600 hover:border-violet-500 dark:hover:border-violet-400'
        }`}
        aria-label={isCompleted ? 'Mark pending' : 'Mark complete'}
      >
        {isCompleted && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'
        }`}>
          {task.title}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1 flex-wrap">
          {task.category && <span>{task.category}</span>}
          {task.category && dueLabel && <span>·</span>}
          {dueLabel && (
            <span className={dueLabel.overdue ? 'text-red-500' : dueLabel.urgent ? 'text-orange-500' : ''}>
              {dueLabel.label}
            </span>
          )}
        </p>
      </div>

      <span className={`shrink-0 text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
        {task.priority}
      </span>
    </div>
  )
}

/* ── Study Progress ──────────────────────────────────────── */
const StudyProgress = ({ tasks }) => {
  const byCategory = {}
  tasks.forEach(t => {
    const cat = t.category || 'Other'
    if (!byCategory[cat]) byCategory[cat] = { total: 0, done: 0 }
    byCategory[cat].total++
    if (t.status === 'completed') byCategory[cat].done++
  })

  const subjects = Object.entries(byCategory).map(([name, { total, done }]) => ({
    name,
    pct: total > 0 ? Math.round((done / total) * 100) : 0,
  }))

  const gradients = [
    'linear-gradient(90deg,#7c3aed,#6d28d9)',
    'linear-gradient(90deg,#2563eb,#4f46e5)',
    'linear-gradient(90deg,#7c3aed,#2563eb)',
    'linear-gradient(90deg,#8b5cf6,#a78bfa)',
  ]

  const overall = subjects.length > 0
    ? Math.round(subjects.reduce((s, x) => s + x.pct, 0) / subjects.length)
    : 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4 sm:gap-5">
      <h3 className="font-semibold text-gray-900 dark:text-white">Study Progress</h3>

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
            <BookOpen size={18} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Add tasks with a <span className="font-medium">category</span> to track progress
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {subjects.slice(0, 4).map(({ name, pct }, i) => (
            <div key={name}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{name}</span>
                <span className="font-bold text-gray-900 dark:text-white ml-2 shrink-0">{pct}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: gradients[i % gradients.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center pt-3 border-t border-gray-50 dark:border-gray-700 mt-auto">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Overall Progress</p>
        <p className="text-3xl font-bold" style={{ color: '#7c3aed' }}>{overall}%</p>
      </div>
    </div>
  )
}

/* ── Main Dashboard ──────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth()
  const { stats, tasks, upcomingTasks, overdueTasks, toggleTask } = useTasks()
  const [showForm, setShowForm] = useState(false)

  const displayTasks = upcomingTasks.length > 0 ? upcomingTasks : tasks.slice(0, 6)
  const studyHours   = tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0)
  const categories   = [...new Set(tasks.map(t => t.category).filter(Boolean))]
  const weeklyGoal   = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 pb-4">

      {/* ── Greeting ── */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-0.5">
            Here&apos;s your study overview for today
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white hover:opacity-90 shrink-0"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
        >
          <Plus size={14} />
          <span className="hidden xs:inline">Add Task</span>
          <span className="xs:hidden">Add</span>
        </button>
      </div>

      {/* ── Stat cards: 1 col → 2 col → 4 col ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Tasks Completed" value={stats.completed}
          icon={CheckCircle2} gradient="linear-gradient(135deg,#10b981,#059669)" trend="+12%"
        />
        <StatCard
          label="Study Hours" value={studyHours > 0 ? `${studyHours}h` : '0h'}
          icon={Clock}         gradient="linear-gradient(135deg,#3b82f6,#4f46e5)"  trend="+8%"
        />
        <StatCard
          label="Active Subjects" value={categories.length}
          icon={BookOpen}       gradient="linear-gradient(135deg,#7c3aed,#6d28d9)" trend="+3%"
        />
        <StatCard
          label="Weekly Goal" value={`${weeklyGoal}%`}
          icon={Target}         gradient="linear-gradient(135deg,#ec4899,#ef4444)" trend="+5%"
        />
      </div>

      {/* ── Overdue alert ── */}
      {overdueTasks.length > 0 && (
        <div className="flex items-center gap-2.5 sm:gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-3 sm:px-4 py-3">
          <AlertCircle size={17} className="text-red-500 dark:text-red-400 shrink-0" />
          <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
            You have <span className="font-semibold">{overdueTasks.length}</span> overdue{' '}
            {overdueTasks.length === 1 ? 'task' : 'tasks'} that need attention.
          </p>
        </div>
      )}

      {/* ── Main grid: stacked mobile → side-by-side lg ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">

        {/* Tasks panel */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-gray-50 dark:border-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Your Tasks</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {displayTasks.length > 0 ? 'Upcoming & recent' : 'No tasks yet'}
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-white hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
            >
              <Plus size={13} /> Add Task
            </button>
          </div>

          <div className="px-4 sm:px-5 md:px-6 py-1 flex-1">
            {displayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                  <CheckCircle2 size={22} className="text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No tasks yet</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                  Click &ldquo;Add Task&rdquo; to get started
                </p>
              </div>
            ) : (
              displayTasks.map(task => (
                <TaskRow key={task.id} task={task} onToggle={toggleTask} />
              ))
            )}
          </div>
        </div>

        {/* Study Progress */}
        <div className="lg:col-span-1">
          <StudyProgress tasks={tasks} />
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Task" size="lg">
        <TaskForm onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}

export default Dashboard
