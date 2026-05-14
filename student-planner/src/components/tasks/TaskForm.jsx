import { useState, useEffect } from 'react'
import { useTasks } from '../../hooks/useTasks'
import { validateTaskForm } from '../../utils/validation'
import { TASK_TYPES, TASK_PRIORITIES, TASK_STATUSES } from '../../utils/constants'
import { toInputDate, fromInputDate } from '../../utils/dateUtils'
import Button from '../common/Button'
import Input  from '../common/Input'

const selectClass = [
  'w-full rounded-xl border border-gray-300 dark:border-gray-600',
  'px-3 py-2.5 text-base sm:text-sm',     /* 16px on mobile = no iOS zoom */
  'bg-white dark:bg-gray-800',
  'text-gray-900 dark:text-gray-100',
  'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
].join(' ')

const labelClass = 'text-sm font-medium text-gray-700 dark:text-gray-300'

const TaskForm = ({ task, onClose }) => {
  const { createTask, updateTask } = useTasks()
  const isEditing = Boolean(task)

  const [form, setForm] = useState({
    title: '', description: '', type: 'assignment',
    priority: 'medium', status: 'pending',
    dueDate: '', estimatedHours: '', category: '',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setForm({
        title:          task.title          || '',
        description:    task.description    || '',
        type:           task.type           || 'assignment',
        priority:       task.priority       || 'medium',
        status:         task.status         || 'pending',
        dueDate:        task.dueDate        ? toInputDate(task.dueDate) : '',
        estimatedHours: task.estimatedHours || '',
        category:       task.category       || '',
      })
    }
  }, [task])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validateTaskForm(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 200))
    const data = {
      ...form,
      title:          form.title.trim(),
      description:    form.description.trim(),
      dueDate:        form.dueDate        ? fromInputDate(form.dueDate) : null,
      estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : null,
      category:       form.category.trim(),
    }
    if (isEditing) updateTask(task.id, data)
    else           createTask(data)
    setLoading(false)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4" noValidate>

      <Input
        label="Task title *"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="e.g. Math homework chapter 4"
        error={errors.title}
      />

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Additional details…"
          rows={3}
          className={`${selectClass} resize-none`}
        />
      </div>

      {/* Type & Priority — stacked on mobile, side-by-side on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Type *</label>
          <select name="type" value={form.type} onChange={handleChange} className={selectClass}>
            {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Priority *</label>
          <select name="priority" value={form.priority} onChange={handleChange} className={selectClass}>
            {TASK_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {errors.priority && <p className="text-xs text-red-500">{errors.priority}</p>}
        </div>
      </div>

      {/* Due date & Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Due date"
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          error={errors.dueDate}
        />
        <Input
          label="Est. hours"
          type="number"
          name="estimatedHours"
          value={form.estimatedHours}
          onChange={handleChange}
          placeholder="e.g. 2.5"
          min="0.5"
          step="0.5"
          error={errors.estimatedHours}
        />
      </div>

      {/* Category & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Category"
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="e.g. Math, Physics"
        />
        {isEditing && (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={selectClass}>
              {TASK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 h-10 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
        >
          {loading && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
          {isEditing ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
