import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { analyticsAPI } from '@/lib/api'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts'
import { TrendUp, TrendDown, Users, Receipt, CurrencyDollar, FileText, Calendar, CreditCard } from '@phosphor-icons/react'
import { format, subDays, subMonths } from 'date-fns'

export default function Analytics() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [salesData, setSalesData] = useState<any[]>([])
  const [taxData, setTaxData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [groupBy, setGroupBy] = useState('day')

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const data = await analyticsAPI.getDashboard()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    }
  }

  // Fetch sales report
  const fetchSalesData = async () => {
    try {
      const endDate = new Date()
      const startDate = subDays(endDate, parseInt(dateRange))
      
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy
      }
      
      const data = await analyticsAPI.getSalesReport(params)
      setSalesData(data)
    } catch (error) {
      console.error('Error fetching sales data:', error)
      toast.error('Failed to load sales data')
    }
  }

  // Fetch tax report
  const fetchTaxData = async () => {
    try {
      const endDate = new Date()
      const startDate = subDays(endDate, parseInt(dateRange))
      
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
      
      const data = await analyticsAPI.getTaxReport(params)
      setTaxData(data)
    } catch (error) {
      console.error('Error fetching tax data:', error)
      toast.error('Failed to load tax data')
    }
  }

  // Initial data fetch
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchDashboardData(),
          fetchSalesData(),
          fetchTaxData()
        ])
      } finally {
        setLoading(false)
      }
    }
    
    loadAllData()
  }, [])

  // Refetch sales and tax data when filters change
  useEffect(() => {
    if (!loading) {
      fetchSalesData()
      fetchTaxData()
    }
  }, [dateRange, groupBy])

  // Format chart data
  const formatSalesChartData = () => {
    return salesData.map(item => ({
      date: format(new Date(item._id.year, (item._id.month || 1) - 1, item._id.day || 1), 
        groupBy === 'month' ? 'MMM yyyy' : 
        groupBy === 'week' ? 'MMM dd' : 'MMM dd'),
      sales: item.totalSales,
      bills: item.billCount,
      avgBill: item.avgBillAmount
    }))
  }

  const formatPaymentStatusData = () => {
    if (!dashboardData?.paymentStatusBreakdown) return []
    
    return dashboardData.paymentStatusBreakdown.map((item: any) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.amount,
      count: item.count
    }))
  }

  const formatMonthlyTrendData = () => {
    if (!dashboardData?.monthlyTrend) return []
    
    return dashboardData.monthlyTrend.map((item: any) => ({
      month: format(new Date(item._id.year, item._id.month - 1), 'MMM yyyy'),
      sales: item.total,
      bills: item.count
    }))
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0']

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-bold">Analytics & Reports</h2>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Analytics & Reports</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Group By</Label>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              ₹{(dashboardData?.summary?.totalSales || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.summary?.totalBills || 0} total bills
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
            <TrendUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              ₹{(dashboardData?.summary?.monthlySales || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              ₹{(dashboardData?.summary?.pendingPayments || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              Outstanding amount
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {dashboardData?.summary?.totalCustomers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Summary */}
      {taxData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">CGST Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                ₹{(taxData.totalCgst || 0).toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">SGST Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                ₹{(taxData.totalSgst || 0).toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">IGST Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                ₹{(taxData.totalIgst || 0).toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tax</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                ₹{(taxData.totalTax || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-muted-foreground">
                {taxData.taxableAmount > 0 ? ((taxData.totalTax / taxData.taxableAmount) * 100).toFixed(1) : 0}% of taxable amount
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formatSalesChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'sales' ? `₹${value.toLocaleString('en-IN')}` : value,
                    name === 'sales' ? 'Sales' : name === 'bills' ? 'Bills' : 'Avg Bill'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8884d8" 
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Monthly Trend (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatMonthlyTrendData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'sales' ? `₹${value.toLocaleString('en-IN')}` : value,
                    name === 'sales' ? 'Sales' : 'Bills'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="bills" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Payment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formatPaymentStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {formatPaymentStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.topCustomers?.slice(0, 5).map((customer: any, index: number) => (
                <div key={customer._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {(customer.customer?.name || 'Unknown').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{customer.customer?.name || 'Unknown Customer'}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.billCount} bills
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      ₹{customer.totalPurchases.toLocaleString('en-IN')}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!dashboardData?.topCustomers || dashboardData.topCustomers.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No customer data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}