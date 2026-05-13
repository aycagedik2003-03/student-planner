const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size] || 'w-8 h-8'

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClass} animate-spin rounded-full border-2 border-gray-200 border-t-blue-600`}
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}

export default LoadingSpinner
