import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, FileText, TrendUp, Users } from '@phosphor-icons/react'

export default function TabNavigation() {
  return (
    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-4 sm:mb-6 h-auto">
      <TabsTrigger 
        value="billing" 
        className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3"
      >
        <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm">New Bill</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="bills" 
        className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3"
      >
        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm">Bills</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="dashboard" 
        className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3 col-span-2 sm:col-span-1"
      >
        <TrendUp className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm">Dashboard</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="analytics" 
        className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3"
      >
        <TrendUp className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm">Analytics</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="customers" 
        className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3"
      >
        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm">Customers</span>
      </TabsTrigger>
    </TabsList>
  )
}