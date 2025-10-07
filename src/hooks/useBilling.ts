import { useState, useEffect, useCallback } from 'react'
import { 
  LineItem, 
  Customer, 
  OldGold, 
  ValidationErrors,
  BillTotals,
  DEFAULT_GOLD_RATES,
  DEFAULT_LINE_ITEM,
  DEFAULT_CUSTOMER,
  PaymentMethod
} from '@/types/billing'
import { 
  validateCustomerField, 
  validateLineItemField, 
  ValidationUtils 
} from '@/utils/validation'
import { calculateBillTotals } from '@/utils/billingCalculations'
import { billsAPI, customersAPI } from '@/lib/api'

/**
 * Hook for managing billing data (bills, gold rates)
 */
export const useBillingData = () => {
  const [bills, setBills] = useState<any[]>([])
  const [goldRates, setGoldRates] = useState<Record<string, number>>(DEFAULT_GOLD_RATES)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load bills and gold rates
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const billsData = await billsAPI.getAll()
        console.log('Bills API response:', billsData)
        
        if (billsData && Array.isArray(billsData.bills)) {
          setBills(billsData.bills)
        } else if (Array.isArray(billsData)) {
          setBills(billsData)
        } else {
          console.error('Invalid bills data format:', billsData)
          setBills([])
        }
        
        // Load saved gold rates
        const savedRates = localStorage.getItem('goldRates')
        if (savedRates) {
          setGoldRates(JSON.parse(savedRates))
        }
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load billing data')
        setBills([])
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Save gold rates to localStorage when they change
  useEffect(() => {
    localStorage.setItem('goldRates', JSON.stringify(goldRates))
  }, [goldRates])

  const updateGoldRates = useCallback((newRates: Partial<Record<string, number>>) => {
    setGoldRates(prev => {
      const updated = { ...prev }
      Object.entries(newRates).forEach(([key, value]) => {
        if (value !== undefined) {
          updated[key] = value
        }
      })
      return updated
    })
  }, [])

  const addBill = useCallback((newBill: any) => {
    setBills(prev => Array.isArray(prev) ? [...prev, newBill] : [newBill])
  }, [])

  return {
    bills,
    goldRates,
    loading,
    error,
    updateGoldRates,
    addBill
  }
}

/**
 * Hook for managing validation state and functions
 */
export const useValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    customer: {},
    lineItems: {}
  })

  const validateCustomer = useCallback((field: keyof Customer, value: string) => {
    const error = validateCustomerField(field, value)
    setValidationErrors(prev => 
      ValidationUtils.updateCustomerValidationError(prev, field, error)
    )
  }, [])

  const validateLineItem = useCallback((itemId: string, field: string, value: any) => {
    const error = validateLineItemField(field, value)
    setValidationErrors(prev => 
      ValidationUtils.updateLineItemValidationError(prev, itemId, field, error)
    )
  }, [])

  const clearLineItemErrors = useCallback((itemId: string) => {
    setValidationErrors(prev => ValidationUtils.clearLineItemErrors(prev, itemId))
  }, [])

  const validateAll = useCallback((customer: Customer, lineItems: LineItem[]) => {
    const result = ValidationUtils.validateEntireForm(customer, lineItems)
    setValidationErrors(result.errors)
    return result.isValid
  }, [])

  const clearAllErrors = useCallback(() => {
    setValidationErrors({ customer: {}, lineItems: {} })
  }, [])

  const hasErrors = useCallback(() => {
    return ValidationUtils.hasValidationErrors(validationErrors)
  }, [validationErrors])

  return {
    validationErrors,
    validateCustomer,
    validateLineItem,
    clearLineItemErrors,
    validateAll,
    clearAllErrors,
    hasErrors
  }
}

/**
 * Hook for managing line items
 */
export const useLineItems = (goldRates: Record<string, number>) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([{
    ...DEFAULT_LINE_ITEM,
    id: '1'
  }])

  const addLineItem = useCallback(() => {
    const newItem: LineItem = {
      ...DEFAULT_LINE_ITEM,
      id: Date.now().toString()
    }
    setLineItems(prev => [...prev, newItem])
  }, [])

  const removeLineItem = useCallback((id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const updateLineItem = useCallback((id: string, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }, [])

  const resetLineItems = useCallback(() => {
    setLineItems([{
      ...DEFAULT_LINE_ITEM,
      id: Date.now().toString()
    }])
  }, [])

  const totals = calculateBillTotals(lineItems, goldRates)

  return {
    lineItems,
    addLineItem,
    removeLineItem,
    updateLineItem,
    resetLineItems,
    totals
  }
}

/**
 * Hook for managing customer data
 */
export const useCustomer = () => {
  const [customer, setCustomer] = useState<Customer>(DEFAULT_CUSTOMER)

  const updateCustomer = useCallback((updates: Partial<Customer>) => {
    setCustomer(prev => ({ ...prev, ...updates }))
  }, [])

  const resetCustomer = useCallback(() => {
    setCustomer(DEFAULT_CUSTOMER)
  }, [])

  return {
    customer,
    updateCustomer,
    resetCustomer
  }
}

/**
 * Hook for managing old gold exchange
 */
export const useOldGold = () => {
  const [oldGold, setOldGold] = useState<OldGold[]>([])

  const addOldGold = useCallback((item: OldGold) => {
    setOldGold(prev => [...prev, item])
  }, [])

  const removeOldGold = useCallback((index: number) => {
    setOldGold(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updateOldGold = useCallback((index: number, updates: Partial<OldGold>) => {
    setOldGold(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ))
  }, [])

  const resetOldGold = useCallback(() => {
    setOldGold([])
  }, [])

  return {
    oldGold,
    addOldGold,
    removeOldGold,
    updateOldGold,
    resetOldGold,
    setOldGold
  }
}

/**
 * Hook for managing payment method
 */
export const usePaymentMethod = () => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')

  const updatePaymentMethod = useCallback((method: PaymentMethod) => {
    setPaymentMethod(method)
  }, [])

  return {
    paymentMethod,
    updatePaymentMethod
  }
}

/**
 * Comprehensive hook that combines all billing functionality
 */
export const useBilling = () => {
  const billingData = useBillingData()
  const validation = useValidation()
  const { lineItems, addLineItem, removeLineItem, updateLineItem, resetLineItems } = useLineItems(billingData.goldRates)
  const { customer, updateCustomer, resetCustomer } = useCustomer()
  const oldGoldHook = useOldGold()
  const { paymentMethod, updatePaymentMethod } = usePaymentMethod()

  // Enhanced line item operations with validation
  const handleUpdateLineItem = useCallback((id: string, updates: Partial<LineItem>) => {
    updateLineItem(id, updates)
    
    // Validate updated fields
    Object.keys(updates).forEach(field => {
      validation.validateLineItem(id, field, updates[field as keyof LineItem])
    })
  }, [updateLineItem, validation])

  const handleRemoveLineItem = useCallback((id: string) => {
    removeLineItem(id)
    validation.clearLineItemErrors(id)
  }, [removeLineItem, validation])

  // Enhanced customer operations with validation
  const handleUpdateCustomer = useCallback((updates: Partial<Customer>) => {
    updateCustomer(updates)
    
    // Validate updated fields
    Object.keys(updates).forEach(field => {
      validation.validateCustomer(field as keyof Customer, updates[field as keyof Customer] || '')
    })
  }, [updateCustomer, validation])

  // Calculate totals with old gold
  const totals = calculateBillTotals(lineItems, billingData.goldRates, oldGoldHook.oldGold)

  // Reset entire form
  const resetForm = useCallback(() => {
    resetLineItems()
    resetCustomer()
    oldGoldHook.resetOldGold()
    validation.clearAllErrors()
  }, [resetLineItems, resetCustomer, oldGoldHook, validation])

  return {
    // Data
    ...billingData,
    lineItems,
    customer,
    oldGold: oldGoldHook.oldGold,
    paymentMethod,
    totals,
    
    // Validation
    ...validation,
    
    // Actions
    addLineItem,
    updateLineItem: handleUpdateLineItem,
    removeLineItem: handleRemoveLineItem,
    updateCustomer: handleUpdateCustomer,
    updatePaymentMethod,
    setOldGold: oldGoldHook.setOldGold,
    resetForm
  }
}