import { useState } from 'react'
import { Plus, BookOpen } from 'lucide-react'
import useTasksStore from '../store/tasksStore'
import { useAuth }   from '../hooks/useAuth'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import Modal    from '../components/common/Modal'

const ExamsPage = () => {
  const { user }   = useAuth()
  const getAllTasks = useTasksStore(s => s.getUserTasks)
  const allTasks   = user ? getAllTasks(user.id) : []
  const examTasks  = allTasks.filter(t => t.type === 'exam' || t.type === 'study_session')

  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)

  const upcoming  = examTasks.filter(t => t.status !== 'completed')
  const completed = examTasks.filter(t => t.status === 'completed')

  return (
    <div className="flex flex-col gap-4 sm:gap-5 max-w-4xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Exams & Study</h2>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {upcoming.length} upcoming · {completed.length} completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white hover:opacity-90 shrink-0"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
        >
          <Plus size={14} /> Add Exam
        </button>
      </div>

      {examTasks.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
            <BookOpen size={20} className="text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">
            No exams or study sessions
          </p>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
            Add your exam schedule here
          </p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-2">
                  Upcoming
                </span>
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
              </div>
              <div className="flex flex-col gap-2.5 sm:gap-3">
                {upcoming.map(task => (
                  <TaskCard key={task.id} task={task} onEdit={t => setEditTask(t)} />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">
                  Completed
                </span>
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
              </div>
              <div className="flex flex-col gap-2.5 sm:gap-3">
                {completed.map(task => (
                  <TaskCard key={task.id} task={task} onEdit={t => setEditTask(t)} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Exam / Study Session" size="lg">
        <TaskForm onClose={() => setShowForm(false)} />
      </Modal>
      <Modal isOpen={Boolean(editTask)} onClose={() => setEditTask(null)} title="Edit Exam" size="lg">
        {editTask && <TaskForm task={editTask} onClose={() => setEditTask(null)} />}
      </Modal>
    </div>
  )
}

export default ExamsPage
