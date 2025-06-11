import { useState } from 'react'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import { UserProvider } from './contexts/UserContext'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  return (
    <UserProvider>
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
    </UserProvider>
  )
}

export default App