import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash } from '@phosphor-icons/react'

interface OldGold {
  description: string
  grossWeight: number
  netWeight: number
  purity: string
  rate: number
}

interface OldGoldExchangeProps {
  oldGold: OldGold[]
  setOldGold: (oldGold: OldGold[]) => void
  goldRates: Record<string, number>
}

export default function OldGoldExchange({ oldGold, setOldGold, goldRates }: OldGoldExchangeProps) {
  const [showExchange, setShowExchange] = useState(false)

  const addOldGoldItem = () => {
    const newItem: OldGold = {
      description: '',
      grossWeight: 0,
      netWeight: 0,
      purity: '22K',
      rate: goldRates['22K'] || 0
    }
    setOldGold([...oldGold, newItem])
    setShowExchange(true)
  }

  const removeOldGoldItem = (index: number) => {
    const newOldGold = oldGold.filter((_, i) => i !== index)
    setOldGold(newOldGold)
    if (newOldGold.length === 0) {
      setShowExchange(false)
    }
  }

  const updateOldGoldItem = (index: number, updates: Partial<OldGold>) => {
    const newOldGold = oldGold.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    )
    setOldGold(newOldGold)
  }

  const calculateOldGoldValue = (item: OldGold) => {
    const purityFactor = item.purity === '24K' ? 1 : item.purity === '22K' ? 0.916 : 0.75
    return item.netWeight * (item.rate / 10) * purityFactor
  }

  const totalOldGoldValue = oldGold.reduce((total, item) => total + calculateOldGoldValue(item), 0)

  if (!showExchange && oldGold.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Old Gold Exchange (Optional)
            <Button onClick={addOldGoldItem} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Old Gold
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No old gold items to exchange. Click "Add Old Gold" to include exchange items.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Old Gold Exchange
          <Button onClick={addOldGoldItem} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {oldGold.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Old Gold Item {index + 1}</h4>
              <Button variant="outline" size="sm" onClick={() => removeOldGoldItem(index)}>
                <Trash className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateOldGoldItem(index, { description: e.target.value })}
                  placeholder="e.g., Old chain, broken ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Purity</Label>
                <Select 
                  value={item.purity} 
                  onValueChange={(value) => updateOldGoldItem(index, { 
                    purity: value,
                    rate: goldRates[value] || 0
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24K">24K</SelectItem>
                    <SelectItem value="22K">22K</SelectItem>
                    <SelectItem value="18K">18K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Gross Weight (gms)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={item.grossWeight || ''}
                  onChange={(e) => updateOldGoldItem(index, { grossWeight: Number(e.target.value) })}
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Net Weight (gms)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={item.netWeight || ''}
                  onChange={(e) => updateOldGoldItem(index, { netWeight: Number(e.target.value) })}
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Rate (per 10g)</Label>
                <Input
                  type="number"
                  value={item.rate || ''}
                  onChange={(e) => updateOldGoldItem(index, { rate: Number(e.target.value) })}
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Value (₹)</Label>
                <Input
                  value={`₹${calculateOldGoldValue(item).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                  disabled
                  className="font-mono bg-muted"
                />
              </div>
            </div>
          </div>
        ))}
        
        {oldGold.length > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Old Gold Value:</span>
              <span className="font-mono font-bold text-lg">
                ₹{totalOldGoldValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}