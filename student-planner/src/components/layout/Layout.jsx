import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/tasks': 'My Tasks',
  '/exams': 'Exams',
  '/schedule': 'Schedule',
  '/settings': 'Settings',
}

const Layout = ({ children }) => {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] || 'Student Planner'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
