import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useKV } from '@github/spark/hooks'
import { TrendUp, Receipt, Users, Calculator } from '@phosphor-icons/react'

export default function Dashboard() {
  const [bills] = useKV<any[]>('bills', [])
  
  const today = new Date().toDateString()
  const todaysBills = bills?.filter(bill => new Date(bill.date).toDateString() === today) || []
  
  const calculateTotals = () => {
    const todayTotal = todaysBills.reduce((sum, bill) => sum + bill.totals.grandTotal, 0)
    const weekTotal = bills?.reduce((sum, bill) => {
      const billDate = new Date(bill.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return billDate >= weekAgo ? sum + bill.totals.grandTotal : sum
    }, 0) || 0
    
    const monthTotal = bills?.reduce((sum, bill) => {
      const billDate = new Date(bill.date)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return billDate >= monthAgo ? sum + bill.totals.grandTotal : sum
    }, 0) || 0
    
    const totalGST = bills?.reduce((sum, bill) => sum + bill.totals.totalGst, 0) || 0
    
    return { todayTotal, weekTotal, monthTotal, totalGST }
  }
  
  const { todayTotal, weekTotal, monthTotal, totalGST } = calculateTotals()
  
  const formatCurrency = (amount: number) => 
    `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString('en-IN')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {todaysBills.length} bills today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            <TrendUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(weekTotal)}</div>
            <p className="text-xs text-muted-foreground">
              Weekly sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthTotal)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total GST Collected</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGST)}</div>
            <p className="text-xs text-muted-foreground">
              All time GST
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bills?.slice(-5).reverse().map((bill, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{bill.billNumber}</div>
                    <div className="text-sm text-muted-foreground">{bill.customer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(bill.date).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-medium">
                      {formatCurrency(bill.totals.grandTotal)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {bill.lineItems.length} items
                    </div>
                  </div>
                </div>
              )) || <div className="text-center text-muted-foreground py-8">No bills yet</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Bills:</span>
              <span className="font-mono">{bills?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Bill Value:</span>
              <span className="font-mono">
                {bills?.length ? formatCurrency(monthTotal / bills.length) : '₹0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Top Purity Sold:</span>
              <span className="font-mono">22K Gold</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span>Mixed</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}