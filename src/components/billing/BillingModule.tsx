import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash, Download } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import LineItemRow from './LineItemRow'
import CustomerSelector from './CustomerSelector'
import OldGoldExchange from './OldGoldExchange'
import TaxSummary from './TaxSummary'

interface LineItem {
  id: string
  purity: string
  description: string
  netWeight: number
  grossWeight: number
  huidNumber: string
  makingChargesType: 'per_gram' | 'flat'
  makingCharges: number
  hallmarkingCharges: number
}

interface Customer {
  name: string
  phone: string
  email?: string
  gstin?: string
}

interface OldGold {
  description: string
  grossWeight: number
  netWeight: number
  purity: string
  rate: number
}

export default function BillingModule() {
  const [bills, setBills] = useKV<any[]>('bills', [])
  const [goldRates, setGoldRates] = useKV<Record<string, number>>('gold-rates', {
    '24K': 6500,
    '22K': 5950,
    '18K': 4875
  })
  
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    phone: '',
    email: '',
    gstin: ''
  })
  
  const [lineItems, setLineItems] = useState<LineItem[]>([{
    id: '1',
    purity: '22K',
    description: '',
    netWeight: 0,
    grossWeight: 0,
    huidNumber: '',
    makingChargesType: 'per_gram',
    makingCharges: 0,
    hallmarkingCharges: 35
  }])
  
  const [oldGold, setOldGold] = useState<OldGold[]>([])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  
  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      purity: '22K',
      description: '',
      netWeight: 0,
      grossWeight: 0,
      huidNumber: '',
      makingChargesType: 'per_gram',
      makingCharges: 0,
      hallmarkingCharges: 35
    }
    setLineItems([...lineItems, newItem])
  }
  
  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id))
  }
  
  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }
  
  const calculateTotals = () => {
    let goldValue = 0
    let makingChargesTotal = 0
    
    lineItems.forEach(item => {
      if (item.netWeight > 0 && goldRates) {
        const ratePerGram = goldRates[item.purity] / 10
        goldValue += item.netWeight * ratePerGram
        
        if (item.makingChargesType === 'per_gram') {
          makingChargesTotal += item.netWeight * item.makingCharges
        } else {
          makingChargesTotal += item.makingCharges
        }
        
        makingChargesTotal += item.hallmarkingCharges
      }
    })
    
    const oldGoldValue = oldGold.reduce((total, item) => {
      const purityFactor = item.purity === '24K' ? 1 : item.purity === '22K' ? 0.916 : 0.75
      return total + (item.netWeight * (item.rate / 10) * purityFactor)
    }, 0)
    
    const taxableValue = goldValue + makingChargesTotal
    const gstOnGold = goldValue * 0.03
    const gstOnMaking = makingChargesTotal * 0.05
    const totalGst = gstOnGold + gstOnMaking
    const grandTotal = taxableValue + totalGst - oldGoldValue
    
    return {
      goldValue,
      makingChargesTotal,
      oldGoldValue,
      taxableValue,
      gstOnGold,
      gstOnMaking,
      totalGst,
      grandTotal
    }
  }
  
  const generateBill = async () => {
    const billNumber = `AS${Date.now()}`
    const totals = calculateTotals()
    
    const bill = {
      billNumber,
      date: new Date().toISOString(),
      customer,
      lineItems,
      oldGold,
      goldRates,
      paymentMethod,
      totals
    }
    
    setBills((currentBills: any[] | undefined) => [...(currentBills || []), bill])
    
    console.log('Bill generated:', bill)
  }
  
  const totals = calculateTotals()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">New Bill Generation</h2>
        <div className="text-sm text-muted-foreground">
          Bill #: AS{Date.now().toString().slice(-6)} | {new Date().toLocaleDateString('en-IN')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CustomerSelector customer={customer} setCustomer={setCustomer} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Gold Rates (per 10g)
                <Button variant="outline" size="sm">Update Rates</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(goldRates || {}).map(([purity, rate]) => (
                  <div key={purity} className="space-y-2">
                    <Label>{purity}</Label>
                    <Input
                      type="number"
                      value={rate}
                      onChange={(e) => setGoldRates((prev: Record<string, number> | undefined) => ({
                        ...(prev || {}),
                        [purity]: Number(e.target.value)
                      }))}
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
                  goldRates={goldRates || {}}
                  onUpdate={(updates) => updateLineItem(item.id, updates)}
                  onRemove={() => removeLineItem(item.id)}
                  canRemove={lineItems.length > 1}
                />
              ))}
            </CardContent>
          </Card>

          <OldGoldExchange
            oldGold={oldGold}
            setOldGold={setOldGold}
            goldRates={goldRates || {}}
          />
        </div>

        <div className="space-y-6">
          <TaxSummary totals={totals} />
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
            disabled={!customer.name || lineItems.some(item => !item.huidNumber)}
          >
            <Download className="w-4 h-4 mr-2" />
            Generate Bill & PDF
          </Button>
        </div>
      </div>
    </div>
  )
}