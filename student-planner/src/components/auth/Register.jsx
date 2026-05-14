import { useState } from 'react'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { validateRegisterForm } from '../../utils/validation'
import Input from '../common/Input'

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
)

const PasswordToggle = ({ show, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
    aria-label={show ? 'Hide password' : 'Show password'}
  >
    {show ? <EyeOff size={17} /> : <Eye size={17} />}
  </button>
)

const Register = ({ onSwitch }) => {
  const navigate   = useNavigate()
  const { register, error, clearError } = useAuth()

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  })
  const [errors,      setErrors]      = useState({})
  const [showPw,      setShowPw]      = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading,     setLoading]     = useState(false)

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
    <div className="w-full">
      {/* ── Brand header ── */}
      <div className="flex flex-col items-center mb-5 sm:mb-7">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-violet-200 dark:shadow-violet-900/40"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          <UserPlus size={24} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Create account
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5">
          Start organizing your student life
        </p>
      </div>

      {/* ── Card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/60 dark:shadow-black/40 border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4" noValidate>

          {/* Server-level error banner */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <p className="text-sm text-red-600 dark:text-red-400 leading-snug">{error}</p>
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
            autoCapitalize="words"
            spellCheck="false"
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
            autoCapitalize="none"
            spellCheck="false"
            inputMode="email"
          />

          <Input
            label="Password"
            type={showPw ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 6 characters"
            error={errors.password}
            autoComplete="new-password"
            rightElement={<PasswordToggle show={showPw} onToggle={() => setShowPw(p => !p)} />}
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
            rightElement={<PasswordToggle show={showConfirm} onToggle={() => setShowConfirm(p => !p)} />}
          />

          {/* Submit — 48px min height for touch target */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 h-12 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            {loading ? <><Spinner /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        {/* Switch to login */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          Already have an account?{' '}
          <button
            onClick={onSwitch}
            className="font-semibold hover:underline underline-offset-2"
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
