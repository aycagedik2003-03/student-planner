import { useState } from 'react'
import Login from '../components/auth/Login'
import Register from '../components/auth/Register'

const LoginPage = () => {
  const [mode, setMode] = useState('login')

  return (
    /*
      Outer div: fills viewport, allows vertical scroll when Register is taller
      than available space (e.g. small screen + virtual keyboard open).
      `min-h-[100dvh]` uses dynamic viewport height so iOS bottom toolbar
      doesn't cause content to be clipped.
    */
    <div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-[#0f1117] dark:to-gray-900">

      {/* Decorative blobs – hidden on mobile to avoid overflow jank */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed hidden sm:block top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #7c3aed, #4f46e5)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed hidden sm:block bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-10 dark:opacity-5 blur-3xl"
        style={{ background: 'radial-gradient(circle, #4f46e5, #7c3aed)' }}
      />

      {/*
        Inner wrapper: centers content when it fits, lets it scroll when it doesn't.
        `flex min-h-[100dvh]` inside the scrollable outer makes the flex container
        at least as tall as the viewport so short content (Login) is still centered.
      */}
      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-5 py-10 sm:px-4">
        <div className="w-full max-w-sm sm:max-w-md">
          {mode === 'login'
            ? <Login onSwitch={() => setMode('register')} />
            : <Register onSwitch={() => setMode('login')} />
          }
        </div>
      </div>
    </div>
  )
}

export default LoginPage
