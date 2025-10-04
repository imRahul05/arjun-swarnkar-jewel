import { Tabs, TabsContent } from '@/components/ui/tabs'
import BillingModule from '@/components/billing/BillingModule'
import BillsModule from '@/components/bills/BillsModule'
import Dashboard from '@/components/dashboard/Dashboard'
import Analytics from '@/components/analytics/Analytics'
import CustomersModule from '@/components/customers/CustomersModule'
import TabNavigation from './TabNavigation'

interface MainContentProps {
  activeTab: string
  onTabChange: (value: string) => void
}

export default function MainContent({ activeTab, onTabChange }: MainContentProps) {
  return (
    <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
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