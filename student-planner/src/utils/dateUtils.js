import { format, formatDistanceToNow, isPast, isToday, isTomorrow, parseISO, isValid } from 'date-fns'

export const formatDate = (dateStr) => {
  if (!dateStr) return 'No due date'
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return 'Invalid date'
    return format(date, 'MMM d, yyyy')
  } catch {
    return 'Invalid date'
  }
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy HH:mm')
  } catch {
    return ''
  }
}

export const getRelativeTime = (dateStr) => {
  if (!dateStr) return ''
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
  } catch {
    return ''
  }
}

export const getDueDateLabel = (dateStr) => {
  if (!dateStr) return null
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return null
    if (isToday(date)) return { label: 'Due today', urgent: true }
    if (isTomorrow(date)) return { label: 'Due tomorrow', urgent: true }
    if (isPast(date)) return { label: 'Overdue', overdue: true }
    return { label: `Due ${format(date, 'MMM d')}`, urgent: false }
  } catch {
    return null
  }
}

export const toInputDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return format(parseISO(dateStr), 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

export const fromInputDate = (inputVal) => {
  if (!inputVal) return null
  return `${inputVal}T00:00:00.000Z`
}
