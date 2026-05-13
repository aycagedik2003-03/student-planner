import { useState } from 'react'
import Login from '../components/auth/Login'
import Register from '../components/auth/Register'

const LoginPage = () => {
  const [mode, setMode] = useState('login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      {mode === 'login'
        ? <Login onSwitch={() => setMode('register')} />
        : <Register onSwitch={() => setMode('login')} />
      }
    </div>
  )
}

export default LoginPage
