import { 
  LineItem, 
  OldGold, 
  BillTotals, 
  FormattedBillItem, 
  BillData,
  PurityType,
  PURITY_FACTORS,
  TAX_RATES
} from '@/types/billing'

/**
 * Calculate bill totals based on line items and old gold
 */
export const calculateBillTotals = (
  lineItems: LineItem[],
  goldRates: Record<string, number>,
  oldGold: OldGold[] = []
): BillTotals => {
  let goldValue = 0
  let makingChargesTotal = 0
  
  // Calculate gold value and making charges
  lineItems.forEach(item => {
    if (item.netWeight > 0 && goldRates[item.purity]) {
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
  
  // Calculate old gold value
  const oldGoldValue = oldGold.reduce((total, item) => {
    const purityFactor = PURITY_FACTORS[item.purity as PurityType] || 0.75
    return total + (item.netWeight * (item.rate / 10) * purityFactor)
  }, 0)
  
  // Calculate taxes
  const taxableValue = goldValue + makingChargesTotal
  const gstOnGold = goldValue * TAX_RATES.GST_ON_GOLD
  const gstOnMaking = makingChargesTotal * TAX_RATES.GST_ON_MAKING
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

/**
 * Calculate individual line item value
 */
export const calculateLineItemValue = (
  item: LineItem,
  goldRates: Record<string, number>
): number => {
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

/**
 * Format line items for bill generation
 */
export const formatBillItems = (
  lineItems: LineItem[],
  goldRates: Record<string, number>
): FormattedBillItem[] => {
  return lineItems.map(item => {
    const rate = goldRates[item.purity] || 0
    const baseAmount = (item.netWeight / 10) * rate
    const makingAmount = item.makingChargesType === 'per_gram' 
      ? (item.netWeight * item.makingCharges)
      : item.makingCharges
    const totalAmount = baseAmount + makingAmount + item.hallmarkingCharges
    const taxableAmount = totalAmount
    const cgstAmount = taxableAmount * TAX_RATES.CGST_RATE
    const sgstAmount = taxableAmount * TAX_RATES.SGST_RATE

    return {
      description: item.description,
      hsnCode: '71131900', // Gold jewelry HSN code
      quantity: 1,
      unit: 'PCS',
      rate: totalAmount,
      amount: totalAmount,
      purity: parseInt(item.purity),
      weight: item.netWeight,
      wastage: 0,
      makingCharges: makingAmount,
      huid: item.huidNumber,
      taxableAmount,
      cgstRate: TAX_RATES.CGST_RATE * 100, // Convert to percentage
      cgstAmount,
      sgstRate: TAX_RATES.SGST_RATE * 100, // Convert to percentage
      sgstAmount,
      igstRate: 0,
      igstAmount: 0
    }
  })
}

/**
 * Create bill data object for API submission
 */
export const createBillData = (
  customerId: string,
  lineItems: LineItem[],
  goldRates: Record<string, number>,
  totals: BillTotals,
  paymentMethod: string,
  oldGold: OldGold[] = []
): BillData => {
  const formattedItems = formatBillItems(lineItems, goldRates)

  return {
    customer: customerId,
    billDate: new Date().toISOString(),
    items: formattedItems,
    subtotal: totals.taxableValue,
    totalCgst: totals.gstOnGold / 2,
    totalSgst: totals.gstOnMaking / 2,
    totalIgst: 0,
    totalTax: totals.totalGst,
    totalAmount: totals.grandTotal,
    roundOffAmount: 0,
    finalAmount: totals.grandTotal,
    paymentMethod: paymentMethod,
    status: 'sent',
    paymentStatus: 'pending',
    notes: 'Thank you for your business!',
    termsAndConditions: 'All sales are final. Please check items before leaving the store.'
  }
}

/**
 * Generate bill number
 */
export const generateBillNumber = (): string => {
  return `AS${Date.now().toString().slice(-6)}`
}

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

/**
 * Calculate stone weight from gross and net weight
 */
export const calculateStoneWeight = (grossWeight: number, netWeight: number): number => {
  return Math.max(0, grossWeight - netWeight)
}

/**
 * Utility class for billing calculations
 */
export class BillingCalculator {
  private goldRates: Record<string, number>

  constructor(goldRates: Record<string, number>) {
    this.goldRates = goldRates
  }

  updateGoldRates(newRates: Record<string, number>): void {
    this.goldRates = { ...this.goldRates, ...newRates }
  }

  calculateTotals(lineItems: LineItem[], oldGold: OldGold[] = []): BillTotals {
    return calculateBillTotals(lineItems, this.goldRates, oldGold)
  }

  calculateItemValue(item: LineItem): number {
    return calculateLineItemValue(item, this.goldRates)
  }

  formatItems(lineItems: LineItem[]): FormattedBillItem[] {
    return formatBillItems(lineItems, this.goldRates)
  }

  createBill(
    customerId: string,
    lineItems: LineItem[],
    paymentMethod: string,
    oldGold: OldGold[] = []
  ): BillData {
    const totals = this.calculateTotals(lineItems, oldGold)
    return createBillData(customerId, lineItems, this.goldRates, totals, paymentMethod, oldGold)
  }
}