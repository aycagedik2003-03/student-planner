import { useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/tasks':     'My Tasks',
  '/exams':     'Exams',
  '/schedule':  'Schedule',
  '/settings':  'Settings',
}

const Layout = ({ children }) => {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] || 'Student Planner'

  // mobileOpen drives the sidebar drawer on screens < md.
  // On md+ it has no visual effect — the sidebar is always in flow there.
  const [mobileOpen, setMobileOpen] = useState(false)
  const openMobile  = useCallback(() => setMobileOpen(true),  [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0f1117]">
      <Sidebar mobileOpen={mobileOpen} onClose={closeMobile} />

      {/* min-w-0 prevents flex child from overflowing on narrow screens */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header title={title} onMenuClick={openMobile} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
