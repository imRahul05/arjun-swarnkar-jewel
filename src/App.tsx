import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/components/auth/AuthContext'
import { Header } from '@/components/layout'
import AllRouting from '@/components/routing/AllRouting'

function AppContent() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <Header user={user} onLogout={logout} />}
      <AllRouting />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App