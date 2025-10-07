/**
 * Example usage of the API retry mechanism
 * 
 * Each API call has a 4-second timeout. If no response within 4 seconds,
 * it will retry up to 3 times total before throwing ServerDownError.
 * 
 * Timeline example:
 * - Attempt 1: 0-4s (timeout) → wait 500ms
 * - Attempt 2: 4.5-8.5s (timeout) → wait 1000ms  
 * - Attempt 3: 9.5-13.5s (timeout) → throw ServerDownError
 */

import { billsAPI, customersAPI, ServerDownError } from '@/lib/api'
import { toast } from 'sonner'

// Example: Handling API calls with retry mechanism
export const exampleUsage = {
  
  // Basic usage - the retry happens automatically
  async loadBills() {
    try {
      const bills = await billsAPI.getAll()
      console.log('Bills loaded successfully:', bills)
      return bills
    } catch (error) {
      if (error instanceof ServerDownError) {
        // Server is definitely down after 3 attempts
        toast.error('Server is currently down. Please try again later.')
        console.error('Server down:', error.message)
      } else {
        // Other types of errors (validation, auth, etc.)
        toast.error('Failed to load bills')
        console.error('API error:', error)
      }
      throw error
    }
  },

  // Example with loading states
  async loadCustomersWithLoading(setLoading: (loading: boolean) => void) {
    setLoading(true)
    try {
      const customers = await customersAPI.getAll()
      toast.success('Customers loaded successfully')
      return customers
    } catch (error) {
      if (error instanceof ServerDownError) {
        toast.error('Unable to connect to server. Please check your connection and try again.')
      } else {
        toast.error('Failed to load customers')
      }
      throw error
    } finally {
      setLoading(false)
    }
  },

  // Example with custom error handling
  async createBillWithRetry(billData: any) {
    try {
      const result = await billsAPI.create(billData)
      toast.success('Bill created successfully!')
      return result
    } catch (error) {
      if (error instanceof ServerDownError) {
        // Show more detailed server down message
        toast.error(
          'Server is temporarily unavailable. Your bill data has been saved locally and will be synced when connection is restored.',
          { duration: 6000 }
        )
        
        // Optional: Save to localStorage for later sync
        const pendingBills = JSON.parse(localStorage.getItem('pendingBills') || '[]')
        pendingBills.push({ ...billData, timestamp: Date.now() })
        localStorage.setItem('pendingBills', JSON.stringify(pendingBills))
        
      } else {
        toast.error('Failed to create bill. Please check your data and try again.')
      }
      throw error
    }
  }
}

// Utility function to check if error is a server down error
export const isServerDownError = (error: any): error is ServerDownError => {
  return error instanceof ServerDownError
}

// Utility function for consistent error handling
export const handleApiError = (error: any, operation: string) => {
  if (isServerDownError(error)) {
    toast.error(`Server is down. Unable to ${operation}. Please try again later.`)
    console.error(`Server down during ${operation}:`, error.message)
  } else {
    toast.error(`Failed to ${operation}`)
    console.error(`API error during ${operation}:`, error)
  }
}

// Example React hook for API calls with retry
export const useApiWithRetry = () => {
  const apiCall = async <T>(
    apiFunction: () => Promise<T>,
    operation: string,
    onSuccess?: (data: T) => void,
    onError?: (error: any) => void
  ): Promise<T | null> => {
    try {
      const result = await apiFunction()
      onSuccess?.(result)
      return result
    } catch (error) {
      handleApiError(error, operation)
      onError?.(error)
      return null
    }
  }

  return { apiCall }
}