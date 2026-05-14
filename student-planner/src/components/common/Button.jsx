import { Loader2 } from 'lucide-react'

const variants = {
  primary:   'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white shadow-sm',
  secondary: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500 dark:text-gray-200',
  danger:    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm',
  ghost:     'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
  success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
  outline:   'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
}

const sizes = {
  sm:   'px-3 py-1.5 text-xs',
  md:   'px-4 py-2 text-sm',
  lg:   'px-6 py-3 text-base',
  icon: 'p-2',
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-medium
        focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1
        dark:focus:ring-offset-gray-900
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  )
}

export default Button
