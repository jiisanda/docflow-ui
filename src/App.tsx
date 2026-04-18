import { useState } from 'react'
import AuthScreen from './components/auth/AuthScreen'
import Desktop from './components/desktop/Desktop'

function getStoredUser(): string | null {
  const token = localStorage.getItem('access_token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.username ?? null
  } catch {
    return null
  }
}

export default function App() {
  const [username, setUsername] = useState<string | null>(getStoredUser)

  const handleAuth = () => {
    setUsername(getStoredUser())
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setUsername(null)
  }

  if (!username) {
    return <AuthScreen onAuth={handleAuth} />
  }

  return <Desktop username={username} onLogout={handleLogout} />
}
