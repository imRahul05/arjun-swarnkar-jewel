import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Download } from '@phosphor-icons/react'
import { billsAPI, customersAPI } from '@/lib/api'
import { generateBillPDF } from '@/lib/pdfGenerator'
import { toast } from 'sonner'
import { useBilling } from '@/hooks/useBilling'
import { createBillData, generateBillNumber } from '@/utils/billingCalculations'
import LineItemRow from './LineItemRow'
import CustomerSelector from './CustomerSelector'
import OldGoldExchange from './OldGoldExchange'
import TaxSummary from './TaxSummary'

export default function BillingModule() {
  // Use comprehensive billing hook
  const {
    // Data
    goldRates,
    updateGoldRates,
    addBill,
    lineItems,
    customer,
    oldGold,
    paymentMethod,
    totals,
    
    // Validation
    validationErrors,
    validateCustomer,
    validateLineItem,
    hasErrors,
    validateAll,
    
    // Actions
    addLineItem,
    updateLineItem,
    removeLineItem,
    updateCustomer,
    updatePaymentMethod,
    setOldGold,
    resetForm
  } = useBilling()
  
  const generateBill = async () => {
    try {
      // Validate all fields before proceeding
      if (!validateAll(customer, lineItems)) {
        toast.error('Please fix all validation errors before generating the bill')
        return
      }

      // Additional business logic validation
      if (lineItems.length === 0) {
        toast.error('Please add at least one item')
        return
      }

      // Check if customer exists or create new one
      let customerId
      try {
        const existingCustomers = await customersAPI.search(customer.phone)
        if (existingCustomers.length > 0) {
          customerId = existingCustomers[0]._id
        } else {
          const newCustomer = await customersAPI.create({
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            gstNumber: customer.gstin
          })
          customerId = newCustomer._id
        }
      } catch (error) {
        console.error('Customer creation error:', error)
        toast.error('Failed to create customer')
        return
      }

      // Create bill data using utility function
      const billData = createBillData(customerId, lineItems, goldRates, totals, paymentMethod, oldGold)

      const savedBill = await billsAPI.create(billData)
      addBill(savedBill)
      await generateBillPDF(savedBill)
      toast.success('Bill generated and PDF downloaded successfully!')
      
      // Reset form
      resetForm()
      
    } catch (error) {
      console.error('Failed to generate bill:', error)
      toast.error('Failed to generate bill. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">New Bill Generation</h2>
        <div className="text-sm text-muted-foreground">
          Bill #: {generateBillNumber()} | {new Date().toLocaleDateString('en-IN')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CustomerSelector 
            customer={customer} 
            setCustomer={updateCustomer}
            validationErrors={validationErrors.customer}
            onFieldBlur={validateCustomer}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Gold Rates (per 10g)
                <Button variant="outline" size="sm">Update Rates</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(goldRates).map(([purity, rate]) => (
                  <div key={purity} className="space-y-2">
                    <Label>{purity}</Label>
                    <Input
                      type="number"
                      value={rate}
                      onChange={(e) => updateGoldRates({
                        [purity]: Number(e.target.value)
                      })}
                      className="font-mono"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Line Items
                <Button onClick={addLineItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lineItems && lineItems.map((item) => (
                <LineItemRow
                  key={item.id}
                  item={item}
                  goldRates={goldRates}
                  onUpdate={(updates) => updateLineItem(item.id, updates)}
                  onRemove={() => removeLineItem(item.id)}
                  canRemove={lineItems.length > 1}
                  validationErrors={validationErrors.lineItems[item.id] || {}}
                  onFieldBlur={(field, value) => validateLineItem(item.id, field, value)}
                />
              ))}
            </CardContent>
          </Card>

          <OldGoldExchange
            oldGold={oldGold}
            setOldGold={setOldGold}
            goldRates={goldRates}
          />
        </div>

        <div className="space-y-6">
          <TaxSummary totals={totals} />
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={paymentMethod} onValueChange={updatePaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="net_banking">Net Banking</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          <Button 
            onClick={generateBill} 
            className="w-full" 
            size="lg"
            disabled={hasErrors() || lineItems.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Generate Bill & PDF
          </Button>
        </div>
      </div>
    </div>
  )
}