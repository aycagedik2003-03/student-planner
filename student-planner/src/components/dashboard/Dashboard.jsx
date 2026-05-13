import { useState } from 'react'
import { Plus, CheckCircle2, Clock, BookOpen, Target, TrendingUp } from 'lucide-react'
import { useTasks } from '../../hooks/useTasks'
import { useAuth } from '../../hooks/useAuth'
import TaskCard from '../tasks/TaskCard'
import TaskForm from '../tasks/TaskForm'
import Modal from '../common/Modal'
import { PRIORITY_COLORS } from '../../utils/constants'
import { getDueDateLabel } from '../../utils/dateUtils'

/* ── Stat card ── */
const StatCard = ({ label, value, icon: Icon, gradient, trend }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: gradient }}
      >
        <Icon size={20} className="text-white" />
      </div>
      {trend !== undefined && (
        <span className="text-xs font-medium text-green-500 flex items-center gap-0.5">
          <TrendingUp size={12} /> {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
)

/* ── Task row ── */
const TaskRow = ({ task, onToggle }) => {
  const dueLabel = getDueDateLabel(task.dueDate)
  const isCompleted = task.status === 'completed'
  const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-gray-50 dark:border-gray-700/60 last:border-0">
      <button
        onClick={() => onToggle(task.id)}
        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
          isCompleted
            ? 'border-violet-500 bg-violet-500'
            : 'border-gray-300 dark:border-gray-500 hover:border-violet-400'
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
        <p className={`text-sm font-medium ${isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
          {task.title}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {task.category && <span>{task.category}</span>}
          {task.category && dueLabel && <span> · </span>}
          {dueLabel && (
            <span className={dueLabel.overdue ? 'text-red-500' : dueLabel.urgent ? 'text-orange-500' : ''}>
              {dueLabel.label}
            </span>
          )}
        </p>
      </div>

      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
        {task.priority}
      </span>
    </div>
  )
}

/* ── Study Progress ── */
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
    'linear-gradient(90deg, #7c3aed, #6d28d9)',
    'linear-gradient(90deg, #2563eb, #4f46e5)',
    'linear-gradient(90deg, #7c3aed, #2563eb)',
    'linear-gradient(90deg, #8b5cf6, #a78bfa)',
  ]

  const overall = subjects.length > 0
    ? Math.round(subjects.reduce((s, x) => s + x.pct, 0) / subjects.length)
    : 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-5">
      <h3 className="font-semibold text-gray-900 dark:text-white">Study Progress</h3>

      {subjects.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
          Add tasks with a category to see progress
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {subjects.slice(0, 4).map(({ name, pct }, i) => (
            <div key={name}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{pct}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: gradients[i % gradients.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center pt-2 border-t border-gray-50 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Overall Progress</p>
        <p className="text-3xl font-bold" style={{ color: '#7c3aed' }}>{overall}%</p>
      </div>
    </div>
  )
}

/* ── Main Dashboard ── */
const Dashboard = () => {
  const { user } = useAuth()
  const { stats, tasks, upcomingTasks, toggleTask } = useTasks()
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)

  const displayTasks = upcomingTasks.length > 0 ? upcomingTasks : tasks.slice(0, 5)
  const studyHours = tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0)
  const categories = [...new Set(tasks.map(t => t.category).filter(Boolean))]
  const weeklyGoal = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
          Here&apos;s your study overview for today
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Tasks Completed"
          value={stats.completed}
          icon={CheckCircle2}
          gradient="linear-gradient(135deg, #10b981, #059669)"
          trend="+12%"
        />
        <StatCard
          label="Study Hours"
          value={studyHours > 0 ? `${studyHours}h` : '0h'}
          icon={Clock}
          gradient="linear-gradient(135deg, #3b82f6, #4f46e5)"
          trend="+8%"
        />
        <StatCard
          label="Active Subjects"
          value={categories.length || 0}
          icon={BookOpen}
          gradient="linear-gradient(135deg, #7c3aed, #6d28d9)"
          trend="+3%"
        />
        <StatCard
          label="Weekly Goal"
          value={`${weeklyGoal}%`}
          icon={Target}
          gradient="linear-gradient(135deg, #ec4899, #ef4444)"
          trend="+5%"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Your Tasks</h3>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              <Plus size={14} /> Add Task
            </button>
          </div>

          <div className="px-6 py-2">
            {displayTasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 size={36} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No tasks yet</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Click &ldquo;Add Task&rdquo; to get started</p>
              </div>
            ) : (
              displayTasks.map(task => (
                <TaskRow key={task.id} task={task} onToggle={toggleTask} />
              ))
            )}
          </div>
        </div>

        {/* Study Progress */}
        <div className="xl:col-span-1">
          <StudyProgress tasks={tasks} />
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

export default Dashboard
