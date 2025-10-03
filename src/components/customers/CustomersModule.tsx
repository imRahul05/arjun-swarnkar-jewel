import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { UserPlus, MagnifyingGlass, Phone, Envelope, Users } from '@phosphor-icons/react'
import { customersAPI, billsAPI } from '@/lib/api'
import { toast } from 'sonner'

interface Customer {
  _id?: string
  name: string
  phone: string
  email?: string
  gstin?: string
}

export default function CustomersModule() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [newCustomer, setNewCustomer] = useState<Customer>({
    name: '',
    phone: '',
    email: '',
    gstin: ''
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Fetch customers and bills on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [customersData, billsData] = await Promise.all([
          customersAPI.getAll(),
          billsAPI.getAll()
        ])
        
        console.log('Customers API response:', customersData)
        console.log('Bills API response:', billsData)
        
        // Handle customers API response format: { customers: [...], pagination: {...} }
        if (customersData && Array.isArray(customersData.customers)) {
          setCustomers(customersData.customers)
        } else if (Array.isArray(customersData)) {
          setCustomers(customersData)
        } else {
          console.error('Invalid customers data format:', customersData)
          setCustomers([])
        }
        
        // Handle bills API response format: { bills: [...], pagination: {...} }
        if (billsData && Array.isArray(billsData.bills)) {
          setBills(billsData.bills)
        } else if (Array.isArray(billsData)) {
          setBills(billsData)
        } else {
          console.error('Invalid bills data format:', billsData)
          setBills([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load data')
        setCustomers([])
        setBills([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const filteredCustomers = Array.isArray(customers) ? customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.gstin && customer.gstin.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : []

  const getCustomerStats = (customer: Customer) => {
    if (!Array.isArray(bills)) {
      return { totalBills: 0, totalSpent: 0, lastVisit: null }
    }
    
    const customerBills = bills.filter(bill => 
      bill.customer?.phone === customer.phone
    )
    
    const totalSpent = customerBills.reduce((sum, bill) => sum + bill.totalAmount, 0)
    const lastVisit = customerBills.length > 0 
      ? new Date(Math.max(...customerBills.map(bill => new Date(bill.billDate).getTime())))
      : null

    return {
      totalBills: customerBills.length,
      totalSpent,
      lastVisit
    }
  }

  const addCustomer = async () => {
    if (newCustomer.name && newCustomer.phone) {
      try {
        const createdCustomer = await customersAPI.create({
          name: newCustomer.name,
          phone: newCustomer.phone,
          email: newCustomer.email,
          gstNumber: newCustomer.gstin
        })
        setCustomers(prev => [...prev, createdCustomer])
        setNewCustomer({ name: '', phone: '', email: '', gstin: '' })
        setIsDialogOpen(false)
        toast.success('Customer added successfully')
      } catch (error) {
        console.error('Error adding customer:', error)
        toast.error('Failed to add customer')
      }
    }
  }

  const deleteCustomer = async (customerId: string, index: number) => {
    try {
      await customersAPI.delete(customerId)
      setCustomers(prev => prev.filter((_, i) => i !== index))
      toast.success('Customer deleted successfully')
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Enter customer name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Email (Optional)</Label>
                <Input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label>GSTIN (Optional)</Label>
                <Input
                  value={newCustomer.gstin}
                  onChange={(e) => setNewCustomer({ ...newCustomer, gstin: e.target.value.toUpperCase() })}
                  placeholder="Enter GSTIN"
                  className="uppercase"
                />
              </div>
              
              <Button onClick={addCustomer} className="w-full" disabled={!newCustomer.name || !newCustomer.phone}>
                Add Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MagnifyingGlass className="w-5 h-5" />
            Search Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name, phone, email, or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Directory ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {!Array.isArray(customers) || customers.length === 0 ? 'No customers added yet' : 'No customers match your search'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Details</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Business Info</TableHead>
                    <TableHead>Purchase History</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer, index) => {
                    const stats = getCustomerStats(customer)
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            {stats.lastVisit && (
                              <div className="text-sm text-muted-foreground">
                                Last visit: {stats.lastVisit.toLocaleDateString('en-IN')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              <span className="font-mono">{customer.phone}</span>
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Envelope className="w-3 h-3" />
                                <span>{customer.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {customer.gstin ? (
                            <Badge variant="outline" className="font-mono text-xs">
                              {customer.gstin}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Individual</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              ₹{stats.totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </div>
                            <div className="text-muted-foreground">
                              {stats.totalBills} {stats.totalBills === 1 ? 'bill' : 'bills'}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteCustomer(customer._id || '', index)}
                            className="text-destructive hover:text-destructive"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(customers) ? customers.length : 0}</div>
            <p className="text-sm text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Business Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(customers) ? customers.filter(c => c.gstin).length : 0}
            </div>
            <p className="text-sm text-muted-foreground">With GSTIN</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Repeat Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(customers) ? customers.filter(customer => {
                const stats = getCustomerStats(customer)
                return stats.totalBills > 1
              }).length : 0}
            </div>
            <p className="text-sm text-muted-foreground">Multiple purchases</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}