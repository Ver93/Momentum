
import { useAuth } from './hooks/useAuth'

import AuthPage from './pages/auth/AuthPage'
import DashboardPage from './pages/dashboard/DashboardPage'

import './styles/variables.css'
import './styles/global.css'
import './styles/components.css'

export default function App() {
  const { session, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="app-loading">
        LOADING MOMENTUM...
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  return (
    <DashboardPage
      session={session}
      onLogout={logout}
    />
  )
}
