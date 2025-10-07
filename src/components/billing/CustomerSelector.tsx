import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MagnifyingGlass, UserPlus } from '@phosphor-icons/react'
import { customersAPI } from '@/lib/api'
import { toast } from 'sonner'
import { Customer } from '@/types/billing'

interface ValidationErrors {
  name?: string
  phone?: string
  email?: string
  gstin?: string
}

interface CustomerSelectorProps {
  customer: Customer
  setCustomer: (customer: Customer) => void
  validationErrors?: ValidationErrors
  onFieldBlur?: (field: keyof Customer, value: string) => void
}

export default function CustomerSelector({ 
  customer, 
  setCustomer, 
  validationErrors = {}, 
  onFieldBlur 
}: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersData = await customersAPI.getAll()
        console.log('Customers API response:', customersData)
        
        if (customersData && Array.isArray(customersData.customers)) {
          setCustomers(customersData.customers)
        } else if (Array.isArray(customersData)) {
          setCustomers(customersData)
        } else if (customersData && Array.isArray(customersData.data)) {
          setCustomers(customersData.data)
        } else {
          console.error('Invalid customers data format:', customersData)
          setCustomers([])
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
        setCustomers([])
      }
    }
    
    fetchCustomers()
  }, [])

  const filteredCustomers = Array.isArray(customers) ? customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  ) : []

  const selectCustomer = (selectedCustomer: Customer) => {
    setCustomer(selectedCustomer)
    setIsDialogOpen(false)
  }

  const addNewCustomer = async () => {
    if (customer.name && customer.phone) {
      try {
        const newCustomer = await customersAPI.create({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          gstNumber: customer.gstin
        })
        setCustomers(prev => [...prev, newCustomer])
        setIsDialogOpen(false)
        toast.success('Customer added successfully')
      } catch (error) {
        console.error('Error adding customer:', error)
        toast.error('Failed to add customer')
      }
    }
  }

  const handleFieldChange = (field: keyof Customer, value: string) => {
    setCustomer({ ...customer, [field]: value })
  }

  const handleFieldBlur = (field: keyof Customer, value: string) => {
    if (onFieldBlur) {
      onFieldBlur(field, value)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-shrink-0">
                <MagnifyingGlass className="w-4 h-4 mr-2" />
                Select Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Select Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredCustomers.map((c, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded cursor-pointer hover:bg-muted"
                      onClick={() => selectCustomer(c)}
                    >
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-muted-foreground">{c.phone}</div>
                      {c.gstin && <div className="text-xs text-muted-foreground">GSTIN: {c.gstin}</div>}
                    </div>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No customers found
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Customer Name *</Label>
            <Input
              value={customer.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={(e) => handleFieldBlur('name', e.target.value)}
              placeholder="Enter customer name"
              className={validationErrors.name ? 'border-red-500' : ''}
            />
            {validationErrors.name && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Phone Number *</Label>
            <Input
              value={customer.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              onBlur={(e) => handleFieldBlur('phone', e.target.value)}
              placeholder="Enter phone number"
              className={`font-mono ${validationErrors.phone ? 'border-red-500' : ''}`}
            />
            {validationErrors.phone && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email (Optional)</Label>
            <Input
              type="email"
              value={customer.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={(e) => handleFieldBlur('email', e.target.value)}
              placeholder="Enter email address"
              className={validationErrors.email ? 'border-red-500' : ''}
            />
            {validationErrors.email && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>GSTIN (Optional)</Label>
            <Input
              value={customer.gstin || ''}
              onChange={(e) => handleFieldChange('gstin', e.target.value.toUpperCase())}
              onBlur={(e) => handleFieldBlur('gstin', e.target.value)}
              placeholder="Enter GSTIN"
              className={`uppercase ${validationErrors.gstin ? 'border-red-500' : ''}`}
            />
            {validationErrors.gstin && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.gstin}</p>
            )}
          </div>
        </div>

        {customer.name && customer.phone && (!Array.isArray(customers) || !customers.some(c => c.name === customer.name && c.phone === customer.phone)) && (
          <Button onClick={addNewCustomer} variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Save as New Customer
          </Button>
        )}
      </CardContent>
    </Card>
  )
}