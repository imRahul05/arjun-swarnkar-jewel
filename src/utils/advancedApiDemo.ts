/**
 * Advanced API Demo - Demonstrating all enhanced features
 * This file showcases:
 * 1. Automatic retry mechanism (3 attempts, 4-second timeout per attempt)
 * 2. Circuit breaker pattern (CLOSED/OPEN/HALF_OPEN states)
 * 3. Network status awareness with offline queue
 * 4. Dynamic timeout configuration per request
 * 5. Exponential backoff retry strategy
 */

import api, { authAPI, billsAPI, customersAPI, analyticsAPI, getCircuitBreakerStatus } from '../lib/api';

// Demo data
const demoCustomer = {
  name: 'Test Customer',
  phone: '+91 9876543210',
  email: 'test@example.com',
  address: '123 Demo Street, Test City',
};

const demoBill = {
  customerId: 'demo-customer-id',
  lineItems: [
    {
      itemName: 'Gold Chain',
      quantity: 1,
      weight: 10.5,
      goldRate: 6500,
      makingCharges: 500,
      description: 'Beautiful gold chain'
    }
  ],
  paymentStatus: 'unpaid',
  paymentMethod: 'cash'
};

/**
 * Demonstrates basic API calls with automatic retry
 */
export async function demoBasicRetry() {
  console.log('🔄 Demo: Basic API calls with automatic retry');
  
  try {
    // These calls will automatically retry up to 3 times if they fail
    // Each attempt waits up to 4 seconds for response
    const customers = await customersAPI.getAll();
    console.log('✅ Customers retrieved:', customers.length);
    
    const bills = await billsAPI.getAll();
    console.log('✅ Bills retrieved:', bills.length);
    
    const dashboard = await analyticsAPI.getDashboard();
    console.log('✅ Dashboard data retrieved');
    
  } catch (error) {
    console.error('❌ All retry attempts failed:', error.message);
  }
}

/**
 * Demonstrates dynamic timeout configuration
 */
export async function demoDynamicTimeouts() {
  console.log('⏱️  Demo: Dynamic timeout configuration');
  
  try {
    // Quick operations with shorter timeout
    console.log('Making quick customer search with 2s timeout...');
    const customers = await customersAPI.search('demo', 2000);
    console.log('✅ Quick search completed');
    
    // Report generation with longer timeout
    console.log('Generating sales report with 15s timeout...');
    const salesReport = await analyticsAPI.getSalesReport({
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }, 15000);
    console.log('✅ Sales report generated');
    
    // Bill creation with extended timeout
    console.log('Creating complex bill with 8s timeout...');
    const newBill = await billsAPI.create(demoBill, 8000);
    console.log('✅ Bill created with ID:', newBill.id);
    
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
  }
}

/**
 * Demonstrates circuit breaker pattern
 */
export async function demoCircuitBreaker() {
  console.log('🔌 Demo: Circuit breaker pattern');
  
  // Check initial circuit breaker state
  let status = getCircuitBreakerStatus();
  console.log('Initial circuit breaker state:', status.state);
  console.log('Failure count:', status.failureCount);
  
  // Simulate multiple failed requests to trigger circuit breaker
  console.log('Simulating multiple failures to trigger circuit breaker...');
  
  for (let i = 1; i <= 6; i++) {
    try {
      // Try to call a non-existent endpoint to cause failures
      await customersAPI.getById('non-existent-id');
    } catch (error) {
      console.log(`Attempt ${i} failed:`, error.response?.status || error.message);
      
      // Check circuit breaker status after each failure
      status = getCircuitBreakerStatus();
      console.log(`Circuit breaker state: ${status.state}, failures: ${status.failureCount}`);
      
      if (status.state === 'OPEN') {
        console.log('🚫 Circuit breaker is now OPEN - requests will be rejected immediately');
        break;
      }
    }
  }
  
  // Try to make a request when circuit breaker is open
  if (status.state === 'OPEN') {
    try {
      await customersAPI.getAll();
    } catch (error) {
      console.log('❌ Request rejected by circuit breaker:', error.message);
    }
  }
  
  // Wait for half-open state
  console.log('Waiting for circuit breaker to enter HALF_OPEN state...');
  await new Promise(resolve => setTimeout(resolve, 31000)); // Wait for cooldown
  
  status = getCircuitBreakerStatus();
  console.log('Circuit breaker state after cooldown:', status.state);
}

/**
 * Demonstrates network status awareness
 */
export async function demoNetworkAwareness() {
  console.log('📶 Demo: Network status awareness');
  
  console.log('Current network status:', getCircuitBreakerStatus().isOnline ? 'Online' : 'Offline');
  
  // Simulate offline scenario
  console.log('Simulating offline requests...');
  
  try {
    // These requests will be queued if offline
    const customerPromise = customersAPI.create(demoCustomer);
    const billPromise = billsAPI.create(demoBill);
    
    console.log('Requests queued for when network comes back online');
    
    // Results will be available when network is restored
    const [customer, bill] = await Promise.all([customerPromise, billPromise]);
    console.log('✅ Queued requests completed when online');
    
  } catch (error) {
    console.error('❌ Network requests failed:', error.message);
  }
}

/**
 * Demonstrates exponential backoff in action
 */
export async function demoExponentialBackoff() {
  console.log('📈 Demo: Exponential backoff retry strategy');
  
  const startTime = Date.now();
  
  try {
    // This will fail and show the exponential backoff timing
    await customersAPI.getById('trigger-500-error');
  } catch (error) {
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`Total time for 3 retry attempts: ${totalTime}ms`);
    console.log('Expected pattern:');
    console.log('- Attempt 1: 0ms (immediate)');
    console.log('- Attempt 2: ~1000ms delay');
    console.log('- Attempt 3: ~2000ms delay');
    console.log('- Final failure: ~4000ms timeout + delays');
  }
}

/**
 * Comprehensive demo showcasing all features
 */
export async function runFullDemo() {
  console.log('🚀 Starting comprehensive API features demo\n');
  
  try {
    await demoBasicRetry();
    console.log('\n');
    
    await demoDynamicTimeouts();
    console.log('\n');
    
    await demoExponentialBackoff();
    console.log('\n');
    
    await demoNetworkAwareness();
    console.log('\n');
    
    // Note: Circuit breaker demo takes 30+ seconds due to cooldown
    // Uncomment to test in development
    // await demoCircuitBreaker();
    
    console.log('✅ Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

/**
 * Real-world usage examples
 */
export const realWorldExamples = {
  
  // Quick user search with short timeout
  quickSearch: async (query: string) => {
    return await customersAPI.search(query, 1500); // 1.5 second timeout
  },
  
  // Complex report generation with long timeout
  generateMonthlyReport: async (month: string, year: string) => {
    return await analyticsAPI.getSalesReport(
      { month, year, includeDetails: true },
      20000 // 20 second timeout for complex reports
    );
  },
  
  // Bulk operations with extended timeout
  bulkCreateBills: async (bills: any[]) => {
    const promises = bills.map(bill => 
      billsAPI.create(bill, 10000) // 10 second timeout per bill
    );
    return await Promise.all(promises);
  },
  
  // Critical operations with standard timeout
  processPayment: async (billId: string, paymentData: any) => {
    // Uses default 4 second timeout - critical for payment processing
    return await billsAPI.updatePaymentStatus(
      billId, 
      paymentData.status, 
      paymentData.method
    );
  },
  
  // Background sync with very long timeout
  syncLargeDataset: async (dataset: any[]) => {
    // 60 second timeout for large dataset synchronization
    return await api.post('/sync/large-dataset', dataset, { timeout: 60000 });
  }
};

// Export demo runner for easy testing
export default runFullDemo;