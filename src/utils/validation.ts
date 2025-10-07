import { Customer, LineItem, ValidationErrors } from '@/types/billing'

// Customer field validation
export const validateCustomerField = (field: keyof Customer, value: string): string => {
  switch (field) {
    case 'name':
      if (!value.trim()) return 'Customer name is required'
      if (value.trim().length < 2) return 'Name must be at least 2 characters'
      break
    case 'phone':
      if (!value.trim()) return 'Phone number is required'
      if (!/^[6-9]\d{9}$/.test(value.replace(/\s+/g, ''))) return 'Enter a valid 10-digit phone number'
      break
    case 'email':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address'
      break
    case 'gstin':
      if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) return 'Enter a valid GSTIN'
      break
  }
  return ''
}

// Line item field validation
export const validateLineItemField = (field: string, value: any): string => {
  switch (field) {
    case 'description':
      if (!value?.toString().trim()) return 'Description is required'
      break
    case 'netWeight':
      if (!value || value <= 0) return 'Net weight must be greater than 0'
      break
    case 'grossWeight':
      if (!value || value <= 0) return 'Gross weight must be greater than 0'
      break
    case 'huidNumber':
      if (!value?.toString().trim()) return 'HUID number is required'
      if (value.toString().length < 6) return 'HUID number must be at least 6 characters'
      break
    case 'makingCharges':
      if (value < 0) return 'Making charges cannot be negative'
      break
  }
  return ''
}

// Comprehensive validation utilities
export class ValidationUtils {
  // Update customer validation errors
  static updateCustomerValidationError(
    prevErrors: ValidationErrors,
    field: keyof Customer,
    error: string
  ): ValidationErrors {
    return {
      ...prevErrors,
      customer: { 
        ...prevErrors.customer, 
        [field]: error || undefined 
      }
    }
  }

  // Update line item validation errors
  static updateLineItemValidationError(
    prevErrors: ValidationErrors,
    itemId: string,
    field: string,
    error: string
  ): ValidationErrors {
    return {
      ...prevErrors,
      lineItems: {
        ...prevErrors.lineItems,
        [itemId]: {
          ...prevErrors.lineItems[itemId],
          [field]: error || undefined
        }
      }
    }
  }

  // Clear line item validation errors
  static clearLineItemErrors(
    prevErrors: ValidationErrors,
    itemId: string
  ): ValidationErrors {
    const newErrors = { ...prevErrors }
    delete newErrors.lineItems[itemId]
    return newErrors
  }

  // Check if form has validation errors
  static hasValidationErrors(validationErrors: ValidationErrors): boolean {
    return Object.values(validationErrors.customer).some(error => error) ||
           Object.values(validationErrors.lineItems).some(itemErrors => 
             Object.values(itemErrors).some(error => error)
           )
  }

  // Validate all customer fields
  static validateAllCustomerFields(customer: Customer): Partial<Record<keyof Customer, string>> {
    const errors: Partial<Record<keyof Customer, string>> = {}

    Object.keys(customer).forEach(field => {
      const key = field as keyof Customer
      if (key !== '_id') { // Skip _id field for validation
        errors[key] = validateCustomerField(key, customer[key] || '')
      }
    })

    return errors
  }

  // Validate all fields for a line item
  static validateAllLineItemFields(item: LineItem): Record<string, string> {
    const fieldsToValidate = ['description', 'netWeight', 'grossWeight', 'huidNumber', 'makingCharges']
    const errors: Record<string, string> = {}

    fieldsToValidate.forEach(field => {
      errors[field] = validateLineItemField(field, item[field as keyof LineItem])
    })

    return errors
  }

  // Validate entire form
  static validateEntireForm(
    customer: Customer,
    lineItems: LineItem[]
  ): { isValid: boolean; errors: ValidationErrors } {
    let hasErrors = false
    const errors: ValidationErrors = {
      customer: {},
      lineItems: {}
    }

    // Validate customer
    const customerErrors = this.validateAllCustomerFields(customer)
    Object.entries(customerErrors).forEach(([field, error]) => {
      if (error) {
        hasErrors = true
        errors.customer[field as keyof Customer] = error
      }
    })

    // Validate line items
    lineItems.forEach(item => {
      const itemErrors = this.validateAllLineItemFields(item)
      Object.entries(itemErrors).forEach(([field, error]) => {
        if (error) {
          hasErrors = true
          if (!errors.lineItems[item.id]) {
            errors.lineItems[item.id] = {}
          }
          errors.lineItems[item.id][field] = error
        }
      })
    })

    return { isValid: !hasErrors, errors }
  }
}

// Export individual functions for backward compatibility
export {
  validateCustomerField as validateCustomer,
  validateLineItemField as validateLineItem
}