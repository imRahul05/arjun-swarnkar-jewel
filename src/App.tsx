import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Receipt, TrendUp, Users, Calculator, FileText, LogOut } from '@phosphor-icons/react'
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-accent-foreground" weight="bold" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Arjun Swarnkar</h1>
                <p className="text-sm text-muted-foreground">Digital Billing System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Welcome, {user?.name}</p>
                <p className="text-xs text-muted-foreground">GST: 24XXXXX1234X1ZX</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              New Bill
            </TabsTrigger>
            <TabsTrigger value="bills" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Bills
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customers
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