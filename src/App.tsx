import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Receipt, TrendUp, Users, Calculator, FileText, SignOut } from '@phosphor-icons/react'
import { AuthProvider, useAuth } from '@/components/auth/AuthContext'
import LoginForm from '@/components/auth/LoginForm'
import BillingModule from '@/components/billing/BillingModule'
import BillsModule from '@/components/bills/BillsModule'
import Dashboard from '@/components/dashboard/Dashboard'
import Analytics from '@/components/analytics/Analytics'
import CustomersModule from '@/components/customers/CustomersModule'
import { toast } from 'sonner'

function AppContent() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('billing')

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" weight="bold" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">BPJ Jewellers</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Digital Billing System</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm font-medium">Welcome, {user?.name}</p>
                <p className="text-xs text-muted-foreground">GST: 19FNAPS0298Q1ZJ</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="self-start sm:self-auto">
                <SignOut className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-4 sm:mb-6 h-auto">
            <TabsTrigger value="billing" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3">
              <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">New Bill</span>
            </TabsTrigger>
            <TabsTrigger value="bills" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Bills</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3 col-span-2 sm:col-span-1">
              <TrendUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3">
              <TrendUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Customers</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="billing">
            <BillingModule />
          </TabsContent>

          <TabsContent value="bills">
            <BillsModule />
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersModule />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App