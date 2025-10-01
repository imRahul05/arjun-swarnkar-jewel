import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface TaxSummaryProps {
  totals: {
    goldValue: number
    makingChargesTotal: number
    oldGoldValue: number
    taxableValue: number
    gstOnGold: number
    gstOnMaking: number
    totalGst: number
    grandTotal: number
  }
}

export default function TaxSummary({ totals }: TaxSummaryProps) {
  const formatCurrency = (amount: number) => 
    `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bill Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Gold Value:</span>
          <span className="font-mono">{formatCurrency(totals.goldValue)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Making Charges:</span>
          <span className="font-mono">{formatCurrency(totals.makingChargesTotal)}</span>
        </div>
        
        <Separator />
        
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span className="font-mono">{formatCurrency(totals.taxableValue)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>GST on Gold (3%):</span>
          <span className="font-mono">{formatCurrency(totals.gstOnGold)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>GST on Making (5%):</span>
          <span className="font-mono">{formatCurrency(totals.gstOnMaking)}</span>
        </div>
        
        <div className="flex justify-between text-sm font-medium">
          <span>Total GST:</span>
          <span className="font-mono">{formatCurrency(totals.totalGst)}</span>
        </div>
        
        {totals.oldGoldValue > 0 && (
          <>
            <Separator />
            <div className="flex justify-between text-sm text-destructive">
              <span>Old Gold Deduction:</span>
              <span className="font-mono">-{formatCurrency(totals.oldGoldValue)}</span>
            </div>
          </>
        )}
        
        <Separator />
        
        <div className="flex justify-between font-bold text-lg">
          <span>Grand Total:</span>
          <span className="font-mono text-primary">{formatCurrency(totals.grandTotal)}</span>
        </div>
        
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>CGST (1.5% + 2.5%):</span>
              <span className="font-mono">{formatCurrency(totals.totalGst / 2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (1.5% + 2.5%):</span>
              <span className="font-mono">{formatCurrency(totals.totalGst / 2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}