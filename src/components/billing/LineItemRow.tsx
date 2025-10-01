import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash } from '@phosphor-icons/react'

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

interface LineItemRowProps {
  item: LineItem
  goldRates: Record<string, number>
  onUpdate: (updates: Partial<LineItem>) => void
  onRemove: () => void
  canRemove: boolean
}

export default function LineItemRow({ item, goldRates, onUpdate, onRemove, canRemove }: LineItemRowProps) {
  const calculateItemValue = () => {
    if (!item.netWeight || !goldRates[item.purity]) return 0
    const ratePerGram = goldRates[item.purity] / 10
    const goldValue = item.netWeight * ratePerGram
    
    let makingValue = 0
    if (item.makingChargesType === 'per_gram') {
      makingValue = item.netWeight * item.makingCharges
    } else {
      makingValue = item.makingCharges
    }
    
    return goldValue + makingValue + item.hallmarkingCharges
  }

  return (
    <Card className="p-4">
      <CardContent className="space-y-4 p-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Item {item.id}</h4>
          {canRemove && (
            <Button variant="outline" size="sm" onClick={onRemove}>
              <Trash className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Purity</Label>
            <Select value={item.purity} onValueChange={(value) => onUpdate({ purity: value })}>
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
          
          <div className="space-y-2 md:col-span-3">
            <Label>Item Description</Label>
            <Input
              value={item.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="e.g., Gold Chain, Earrings"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Net Weight (gms)</Label>
            <Input
              type="number"
              step="0.001"
              value={item.netWeight || ''}
              onChange={(e) => onUpdate({ netWeight: Number(e.target.value) })}
              className="font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Gross Weight (gms)</Label>
            <Input
              type="number"
              step="0.001"
              value={item.grossWeight || ''}
              onChange={(e) => onUpdate({ grossWeight: Number(e.target.value) })}
              className="font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Stone Weight (gms)</Label>
            <Input
              type="number"
              value={Math.max(0, item.grossWeight - item.netWeight).toFixed(3)}
              disabled
              className="font-mono bg-muted"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>HUID Number *</Label>
            <Input
              value={item.huidNumber}
              onChange={(e) => onUpdate({ huidNumber: e.target.value.toUpperCase() })}
              placeholder="ABC123"
              maxLength={6}
              className="uppercase"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Making Charges</Label>
            <Select 
              value={item.makingChargesType} 
              onValueChange={(value: 'per_gram' | 'flat') => onUpdate({ makingChargesType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_gram">Per Gram</SelectItem>
                <SelectItem value="flat">Flat Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              value={item.makingCharges || ''}
              onChange={(e) => onUpdate({ makingCharges: Number(e.target.value) })}
              placeholder={item.makingChargesType === 'per_gram' ? 'Per gram' : 'Total'}
              className="font-mono"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Hallmarking Charges (₹)</Label>
            <Input
              type="number"
              value={item.hallmarkingCharges || ''}
              onChange={(e) => onUpdate({ hallmarkingCharges: Number(e.target.value) })}
              className="font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Item Total (₹)</Label>
            <Input
              value={`₹${calculateItemValue().toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
              disabled
              className="font-mono bg-muted font-medium"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}