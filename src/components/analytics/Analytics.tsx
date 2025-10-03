import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { billsAPI } from '@/lib/api'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

export default function Analytics() {
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [filterPurity, setFilterPurity] = useState('all')

  // Fetch bills on component mount
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true)
        const billsData = await billsAPI.getAll()
        setBills(billsData)
      } catch (error) {
        console.error('Error fetching bills:', error)
        toast.error('Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchBills()
  }, [])
  
  const filterBills = () => {
    if (!bills.length) return []
    
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange))
    
    return bills.filter(bill => {
      const billDate = new Date(bill.billDate)
      const dateMatch = billDate >= daysAgo
      const purityMatch = filterPurity === 'all' || 
        bill.items.some((item: any) => item.purity.toString() + 'K' === filterPurity)
      
      return dateMatch && purityMatch
    })
  }
  
  const filteredBills = filterBills()
  
  const getSalesData = () => {
    const salesMap = new Map()
    
    filteredBills.forEach(bill => {
      const date = new Date(bill.billDate).toLocaleDateString('en-IN')
      const existing = salesMap.get(date) || 0
      salesMap.set(date, existing + bill.totalAmount)
    })
    
    return Array.from(salesMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14)
  }
  
  const getPurityData = () => {
    const purityMap = new Map()
    
    filteredBills.forEach(bill => {
      bill.items.forEach((item: any) => {
        const purity = item.purity + 'K'
        const existing = purityMap.get(purity) || 0
        purityMap.set(purity, existing + item.amount)
      })
    })
    
    return Array.from(purityMap.entries()).map(([purity, value]) => ({
      name: purity,
      value: Math.round(value)
    }))
  }
  
  const getMakingChargesData = () => {
    const itemTypes = new Map()
    
    filteredBills.forEach(bill => {
      bill.items.forEach((item: any) => {
        const type = item.description.split(' ')[1] || 'Other'
        const makingCharges = item.makingCharges || 0
        
        const existing = itemTypes.get(type) || { total: 0, making: 0, count: 0 }
        itemTypes.set(type, {
          total: existing.total + item.amount,
          making: existing.making + makingCharges,
          count: existing.count + 1
        })
      })
    })
    
    return Array.from(itemTypes.entries()).map(([type, data]) => ({
      type,
      percentage: data.total > 0 ? (data.making / data.total * 100).toFixed(1) : 0,
      avgMaking: data.count > 0 ? (data.making / data.count).toFixed(0) : 0
    })).slice(0, 5)
  }
  
  const salesData = getSalesData()
  const purityData = getPurityData()
  const makingChargesData = getMakingChargesData()
  
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1']
  
  const totalSales = filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0)
  const totalGST = filteredBills.reduce((sum, bill) => sum + (bill.totalCgst + bill.totalSgst + bill.totalIgst), 0)
  const avgBillValue = filteredBills.length > 0 ? totalSales / filteredBills.length : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics & Reports</h2>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading analytics data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics & Reports</h2>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
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
        
        <div className="space-y-2">
          <Label>Filter by Purity</Label>
          <Select value={filterPurity} onValueChange={setFilterPurity}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Purities</SelectItem>
              <SelectItem value="24K">24K Gold</SelectItem>
              <SelectItem value="22K">22K Gold</SelectItem>
              <SelectItem value="18K">18K Gold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-sm text-muted-foreground">{filteredBills.length} bills</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total GST</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalGST.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-sm text-muted-foreground">
              {totalSales > 0 ? ((totalGST / totalSales) * 100).toFixed(1) : 0}% of sales
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Avg Bill Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{avgBillValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-sm text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Purity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={purityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {purityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Value']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Making Charges Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={makingChargesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="percentage" fill="#82ca9d" name="Making Charges %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}