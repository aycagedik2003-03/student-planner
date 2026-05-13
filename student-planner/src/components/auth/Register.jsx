import { useState } from 'react'
import { Eye, EyeOff, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { validateRegisterForm } from '../../utils/validation'
import Button from '../common/Button'
import Input from '../common/Input'

const Register = ({ onSwitch }) => {
  const navigate = useNavigate()
  const { register, error, clearError } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (error) clearError()
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validateRegisterForm(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 350))
    const ok = register(form.name.trim(), form.email, form.password)
    setLoading(false)
    if (ok) navigate('/dashboard', { replace: true })
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
          <BookOpen size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Start organizing your student life</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <Input
            label="Full name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Smith"
            error={errors.name}
            autoComplete="name"
          />

          <Input
            label="Email address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@university.edu"
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 6 characters"
            error={errors.password}
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <Input
            label="Confirm password"
            type={showConfirm ? 'text' : 'password'}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            error={errors.confirmPassword}
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirm(p => !p)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <button
            onClick={onSwitch}
            className="font-medium hover:underline"
            style={{ color: '#7c3aed' }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register
