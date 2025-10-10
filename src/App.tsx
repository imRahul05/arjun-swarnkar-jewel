import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/components/auth/AuthContext'
import { Header } from '@/components/layout'
import AllRouting from '@/components/routing/AllRouting'

function AppContent() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <Header user={user} onLogout={logout} />}
      {isAuthenticated && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm px-4 py-2">
          GST is now calculated on the combined gold value and making charges. Hallmarking fees remain disabled.
        </div>
      )}
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