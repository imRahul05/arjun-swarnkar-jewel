// Core billing interfaces and types

export interface LineItem {
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

export interface Customer {
  _id?: string
  name: string
  phone: string
  email?: string
  gstin?: string
}

export interface OldGold {
  description: string
  grossWeight: number
  netWeight: number
  purity: string
  rate: number
}

export interface ValidationErrors {
  customer: {
    name?: string
    phone?: string
    email?: string
    gstin?: string
  }
  lineItems: Record<string, {
    description?: string
    netWeight?: string
    grossWeight?: string
    huidNumber?: string
    makingCharges?: string
  }>
}

export interface BillTotals {
  goldValue: number
  makingChargesTotal: number
  oldGoldValue: number
  taxableValue: number
  cgstAmount: number
  sgstAmount: number
  totalGst: number
  grandTotal: number
}

export interface FormattedBillItem {
  description: string
  hsnCode: string
  quantity: number
  unit: string
  rate: number
  amount: number
  purity: number
  weight: number
  wastage: number
  makingCharges: number
  huid: string
  taxableAmount: number
  cgstRate: number
  cgstAmount: number
  sgstRate: number
  sgstAmount: number
  igstRate: number
  igstAmount: number
}

export interface BillData {
  customer: string
  billDate: string
  items: FormattedBillItem[]
  subtotal: number
  totalCgst: number
  totalSgst: number
  totalIgst: number
  totalTax: number
  totalAmount: number
  roundOffAmount: number
  finalAmount: number
  paymentMethod: string
  status: string
  paymentStatus: string
  notes: string
  termsAndConditions: string
}

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'net_banking'
export type PurityType = '24K' | '22K' | '18K'
export type MakingChargesType = 'per_gram' | 'flat'

// Constants
export const DEFAULT_GOLD_RATES: Record<PurityType, number> = {
  '24K': 126000,
  '22K': 90000,
  '18K': 70000
}

export const DEFAULT_LINE_ITEM: Omit<LineItem, 'id'> = {
  purity: '22K',
  description: '',
  netWeight: 0,
  grossWeight: 0,
  huidNumber: '',
  makingChargesType: 'per_gram',
  makingCharges: 0,
  hallmarkingCharges: 0
}

export const DEFAULT_CUSTOMER: Customer = {
  name: '',
  phone: '',
  email: '',
  gstin: ''
}

export const PURITY_FACTORS: Record<PurityType, number> = {
  '24K': 1,
  '22K': 0.916,
  '18K': 0.75
}

export const TAX_RATES = {
  GST_RATE: 0.03,
  CGST_RATE: 0.015,
  SGST_RATE: 0.015
} as const