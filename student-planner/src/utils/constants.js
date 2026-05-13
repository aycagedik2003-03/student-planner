export const TASK_TYPES = [
  { value: 'assignment', label: 'Assignment', color: 'blue' },
  { value: 'exam', label: 'Exam', color: 'red' },
  { value: 'study_session', label: 'Study Session', color: 'green' },
  { value: 'project', label: 'Project', color: 'purple' },
  { value: 'other', label: 'Other', color: 'gray' },
]

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'red' },
]

export const TASK_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

export const SORT_OPTIONS = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
  { value: 'createdAt', label: 'Created At' },
]

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
  { path: '/exams', label: 'Exams', icon: 'BookOpen' },
  { path: '/schedule', label: 'Schedule', icon: 'Calendar' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
]

export const TYPE_COLORS = {
  assignment: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  exam: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  study_session: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  project: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  other: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' },
}

export const PRIORITY_COLORS = {
  low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
  high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
}
