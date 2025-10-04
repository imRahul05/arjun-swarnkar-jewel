import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthContext'
import LoginForm from '@/components/auth/LoginForm'
import ProtectedRoute from '@/components/routing/ProtectedRoute'
import MainContentWithRouting from '@/components/layout/MainContentWithRouting'
import Profile from '@/components/profile/Profile'
import NotFound from '@/components/notFound/not-found'
import LoadingScreen from '@/components/layout/LoadingScreen'

function LoginWrapper() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  
  // If authenticated, redirect to intended destination or home
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }
  
  return <LoginForm />
}

export default function AllRouting() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={<LoginWrapper />}
      />

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainContentWithRouting />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />

      {/* 404 Not Found - this should be before the catch-all */}
      <Route path="/404" element={<NotFound />} />

      {/* Catch all route - redirect to 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}