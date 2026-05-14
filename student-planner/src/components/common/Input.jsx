const Input = ({
  label,
  error,
  helperText,
  className = '',
  inputClassName = '',
  leftIcon,
  rightElement,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={`
            w-full rounded-xl border
            px-3.5 py-3
            /* 16px font prevents iOS Safari from auto-zooming on focus */
            text-base sm:text-sm
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
            ${error
              ? 'border-red-400 dark:border-red-600 bg-red-50/30 dark:bg-red-900/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${leftIcon    ? 'pl-10'  : ''}
            ${rightElement ? 'pr-11' : ''}
            ${inputClassName}
          `}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-start gap-1.5 leading-tight">
          <svg
            className="w-3.5 h-3.5 shrink-0 mt-px"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  )
}

export default Input
