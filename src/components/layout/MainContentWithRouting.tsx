import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import BillingModule from '@/components/billing/BillingModule'
import BillsModule from '@/components/bills/BillsModule'
import Dashboard from '@/components/dashboard/Dashboard'
import Analytics from '@/components/analytics/Analytics'
import CustomersModule from '@/components/customers/CustomersModule'
import TabNavigation from './TabNavigation'

export default function MainContentWithRouting() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('billing')

  // Extract tab from URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const tab = searchParams.get('tab') || 'billing'
    setActiveTab(tab)
  }, [location.search])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    navigate(`/?tab=${value}`)
  }

  return (
    <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabNavigation />

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
  )
}