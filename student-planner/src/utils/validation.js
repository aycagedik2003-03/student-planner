export const validateEmail = email => {
  if (!email) return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.'
  return null
}

export const validatePassword = password => {
  if (!password) return 'Password is required.'
  if (password.length < 6) return 'Password must be at least 6 characters.'
  return null
}

export const validateName = name => {
  if (!name || !name.trim()) return 'Name is required.'
  if (name.trim().length < 2) return 'Name must be at least 2 characters.'
  return null
}

export const validateTaskForm = data => {
  const errors = {}
  if (!data.title || !data.title.trim()) errors.title = 'Title is required.'
  else if (data.title.trim().length < 2) errors.title = 'Title must be at least 2 characters.'
  if (!data.type) errors.type = 'Task type is required.'
  if (!data.priority) errors.priority = 'Priority is required.'
  if (data.estimatedHours && (isNaN(data.estimatedHours) || Number(data.estimatedHours) <= 0)) {
    errors.estimatedHours = 'Estimated hours must be a positive number.'
  }
  return errors
}

export const validateLoginForm = data => {
  const errors = {}
  const emailErr = validateEmail(data.email)
  const passErr = validatePassword(data.password)
  if (emailErr) errors.email = emailErr
  if (passErr) errors.password = passErr
  return errors
}

export const validateRegisterForm = data => {
  const errors = {}
  const nameErr = validateName(data.name)
  const emailErr = validateEmail(data.email)
  const passErr = validatePassword(data.password)
  if (nameErr) errors.name = nameErr
  if (emailErr) errors.email = emailErr
  if (passErr) errors.password = passErr
  if (!data.confirmPassword) errors.confirmPassword = 'Please confirm your password.'
  else if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  return errors
}
