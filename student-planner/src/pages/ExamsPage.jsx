import { useState } from 'react'
import { Plus, BookOpen } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import useTasksStore from '../store/tasksStore'
import { useAuth } from '../hooks/useAuth'

const ExamsPage = () => {
  const { user } = useAuth()
  const getAllTasks = useTasksStore(s => s.getUserTasks)
  const allTasks = user ? getAllTasks(user.id) : []
  const examTasks = allTasks.filter(t => t.type === 'exam' || t.type === 'study_session')

  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)

  const upcoming = examTasks.filter(t => t.status !== 'completed')
  const completed = examTasks.filter(t => t.status === 'completed')

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Exams & Study</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {upcoming.length} upcoming · {completed.length} completed
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Exam
        </Button>
      </div>

      {examTasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <BookOpen size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No exams or study sessions</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your exam schedule here</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Upcoming
              </h3>
              <div className="flex flex-col gap-3">
                {upcoming.map(task => (
                  <TaskCard key={task.id} task={task} onEdit={t => setEditTask(t)} />
                ))}
              </div>
            </section>
          )}
          {completed.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wide">
                Completed
              </h3>
              <div className="flex flex-col gap-3">
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
