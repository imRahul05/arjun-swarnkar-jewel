import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash } from '@phosphor-icons/react'
import { LineItem } from '@/types/billing'
import { calculateLineItemValue } from '@/utils/billingCalculations'

interface ValidationErrors {
  description?: string
  netWeight?: string
  grossWeight?: string
  huidNumber?: string
  makingCharges?: string
}

interface LineItemRowProps {
  item: LineItem
  goldRates: Record<string, number>
  onUpdate: (updates: Partial<LineItem>) => void
  onRemove: () => void
  canRemove: boolean
  validationErrors?: ValidationErrors
  onFieldBlur?: (field: string, value: any) => void
}

export default function LineItemRow({ 
  item, 
  goldRates, 
  onUpdate, 
  onRemove, 
  canRemove,
  validationErrors = {},
  onFieldBlur
}: LineItemRowProps) {
  const calculateItemValue = () => {
    return calculateLineItemValue(item, goldRates)
  }

  const handleFieldChange = (field: keyof LineItem, value: any) => {
    onUpdate({ [field]: value })
  }

  const handleFieldBlur = (field: string, value: any) => {
    if (onFieldBlur) {
      onFieldBlur(field, value)
    }
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
            <Select value={item.purity} onValueChange={(value) => handleFieldChange('purity', value)}>
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
            <Label>Item Description *</Label>
            <Input
              value={item.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              onBlur={(e) => handleFieldBlur('description', e.target.value)}
              placeholder="e.g., Gold Chain, Earrings"
              className={validationErrors.description ? 'border-red-500' : ''}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.description}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Net Weight (gms) *</Label>
            <Input
              type="number"
              step="0.001"
              value={item.netWeight || ''}
              onChange={(e) => handleFieldChange('netWeight', Number(e.target.value))}
              onBlur={(e) => handleFieldBlur('netWeight', Number(e.target.value))}
              className={`font-mono ${validationErrors.netWeight ? 'border-red-500' : ''}`}
            />
            {validationErrors.netWeight && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.netWeight}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Gross Weight (gms) *</Label>
            <Input
              type="number"
              step="0.001"
              value={item.grossWeight || ''}
              onChange={(e) => handleFieldChange('grossWeight', Number(e.target.value))}
              onBlur={(e) => handleFieldBlur('grossWeight', Number(e.target.value))}
              className={`font-mono ${validationErrors.grossWeight ? 'border-red-500' : ''}`}
            />
            {validationErrors.grossWeight && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.grossWeight}</p>
            )}
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
              onChange={(e) => handleFieldChange('huidNumber', e.target.value.toUpperCase())}
              onBlur={(e) => handleFieldBlur('huidNumber', e.target.value)}
              placeholder="ABC123"
              maxLength={6}
              className={`uppercase ${validationErrors.huidNumber ? 'border-red-500' : ''}`}
            />
            {validationErrors.huidNumber && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.huidNumber}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Making Charges</Label>
            <Select 
              value={item.makingChargesType} 
              onValueChange={(value: 'per_gram' | 'flat') => handleFieldChange('makingChargesType', value)}
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
              onChange={(e) => handleFieldChange('makingCharges', Number(e.target.value))}
              onBlur={(e) => handleFieldBlur('makingCharges', Number(e.target.value))}
              placeholder={item.makingChargesType === 'per_gram' ? 'Per gram' : 'Total'}
              className={`font-mono ${validationErrors.makingCharges ? 'border-red-500' : ''}`}
            />
            {validationErrors.makingCharges && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.makingCharges}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Hallmarking Charges</Label>
            <Input
              type="number"
              value={0}
              disabled
              className="font-mono bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Hallmarking charges are currently disabled.
            </p>
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