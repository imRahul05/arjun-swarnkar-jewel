# Advanced API System Documentation

## Overview
This documentation covers the enhanced API system that provides:
- **Automatic Retry Mechanism**: 3 attempts with 4-second timeout per request
- **Circuit Breaker Pattern**: Server protection with CLOSED/OPEN/HALF_OPEN states
- **Network Status Awareness**: Offline request queuing and network detection
- **Dynamic Timeout Configuration**: Per-request timeout customization
- **Exponential Backoff**: Intelligent retry delays

## Core Features

### 1. Automatic Retry Mechanism
Every API call automatically retries up to 3 times if it fails.

```typescript
// This will retry up to 3 times automatically
const customers = await customersAPI.getAll();

// Each attempt waits max 4 seconds for response
// Total max time: 4s + 1s delay + 4s + 2s delay + 4s = ~15 seconds
```

**Retry Behavior:**
- **Attempt 1**: Immediate (0ms delay)
- **Attempt 2**: 1000ms delay (exponential backoff)
- **Attempt 3**: 2000ms delay (exponential backoff)
- **Failure**: Throws error after all attempts

### 2. Dynamic Timeout Configuration
Customize timeout per request based on operation complexity.

```typescript
// Quick operations - short timeout
const result = await customersAPI.search('query', 2000); // 2 seconds

// Complex operations - long timeout
const report = await analyticsAPI.getSalesReport(params, 15000); // 15 seconds

// Default timeout used if not specified
const bills = await billsAPI.getAll(); // Uses default 4 seconds
```

**Recommended Timeouts:**
- **Quick searches**: 1-2 seconds
- **Standard CRUD**: 4 seconds (default)
- **Complex operations**: 8-10 seconds
- **Reports/Analytics**: 15-20 seconds
- **Bulk operations**: 30-60 seconds

### 3. Circuit Breaker Pattern
Protects your server from being overwhelmed during failures.

```typescript
// Check circuit breaker status
const status = getCircuitBreakerStatus();
console.log('State:', status.state); // CLOSED, OPEN, or HALF_OPEN
console.log('Failures:', status.failureCount);
console.log('Queue size:', status.queuedRequests);
```

**Circuit States:**
- **CLOSED**: Normal operation, requests pass through
- **OPEN**: Server is down, requests fail immediately (30s cooldown)
- **HALF_OPEN**: Testing server recovery with limited requests

**Failure Thresholds:**
- **Opens after**: 5 consecutive failures
- **Cooldown period**: 30 seconds
- **Half-open test**: 1 request to test recovery

### 4. Network Status Awareness
Automatically handles offline scenarios with request queuing.

```typescript
// Requests are queued when offline and executed when online
const customer = await customersAPI.create(customerData);
// This will execute immediately if online, or queue if offline
```

**Offline Behavior:**
- Detects network connectivity changes
- Queues non-GET requests when offline
- Executes queued requests when connectivity returns
- GET requests fail immediately when offline

### 5. Exponential Backoff Strategy
Intelligent retry delays to avoid overwhelming servers.

```typescript
// Retry timing pattern:
// Request 1: 0ms delay (immediate)
// Request 2: 1000ms delay (1 second)
// Request 3: 2000ms delay (2 seconds)
```

## API Method Examples

### Authentication API
```typescript
// Login with custom timeout
await authAPI.login('email@example.com', 'password', 5000);

// Get profile (uses default timeout)
const profile = await authAPI.getProfile();

// Change password with standard timeout
await authAPI.changePassword('old', 'new', 4000);

// Logout (uses default timeout)
await authAPI.logout();
```

### Bills API
```typescript
// Get all bills (default timeout)
const bills = await billsAPI.getAll();

// Create bill with extended timeout (bill creation can be complex)
const newBill = await billsAPI.create(billData, 8000);

// Update payment status (critical operation, default timeout)
await billsAPI.updatePaymentStatus(id, 'paid', 'cash');

// Delete bill (default timeout)
await billsAPI.delete(billId);
```

### Customers API
```typescript
// Quick search with short timeout
const results = await customersAPI.search('query', 2000);

// Get all customers (default timeout)
const customers = await customersAPI.getAll();

// Create customer (default timeout)
const customer = await customersAPI.create(customerData);

// Update customer (default timeout)
await customersAPI.update(customerId, updateData);
```

### Analytics API
```typescript
// Dashboard data (default timeout)
const dashboard = await analyticsAPI.getDashboard();

// Sales report with extended timeout (reports can be slow)
const salesReport = await analyticsAPI.getSalesReport(params, 15000);

// Tax report with extended timeout
const taxReport = await analyticsAPI.getTaxReport(params, 15000);
```

## Real-World Usage Patterns

### Quick User Actions
```typescript
// Search operations with short timeouts
const searchCustomers = async (query: string) => {
  return await customersAPI.search(query, 1500); // 1.5 seconds
};
```

### Complex Business Operations
```typescript
// Bill creation with proper timeout
const createComplexBill = async (billData: any) => {
  return await billsAPI.create(billData, 8000); // 8 seconds
};
```

### Report Generation
```typescript
// Monthly reports with long timeouts
const generateMonthlyReport = async (month: string, year: string) => {
  return await analyticsAPI.getSalesReport(
    { month, year, includeDetails: true },
    20000 // 20 seconds
  );
};
```

### Bulk Operations
```typescript
// Process multiple bills with extended timeouts
const bulkCreateBills = async (bills: any[]) => {
  const promises = bills.map(bill => 
    billsAPI.create(bill, 10000) // 10 seconds per bill
  );
  return await Promise.all(promises);
};
```

## Error Handling Best Practices

### Handle Specific Error Types
```typescript
try {
  const result = await customersAPI.create(customerData);
} catch (error) {
  if (error.code === 'CIRCUIT_BREAKER_OPEN') {
    // Server is down, show maintenance message
    showMaintenanceMessage();
  } else if (error.code === 'NETWORK_ERROR') {
    // Network issue, retry later
    showNetworkErrorMessage();
  } else if (error.response?.status === 400) {
    // Validation error, show form errors
    showValidationErrors(error.response.data);
  } else {
    // General error
    showGenericErrorMessage();
  }
}
```

### Monitor Circuit Breaker Status
```typescript
// Check server health periodically
const checkServerHealth = () => {
  const status = getCircuitBreakerStatus();
  
  if (status.state === 'OPEN') {
    showServerDownBanner();
  } else if (status.failureCount > 2) {
    showServerIssueWarning();
  }
};

// Check every 30 seconds
setInterval(checkServerHealth, 30000);
```

## Configuration Options

### Default Timeouts
```typescript
const DEFAULT_CONFIG = {
  timeout: 4000,           // 4 second timeout per request
  retries: 3,              // 3 attempts maximum
  retryDelay: 1000,        // Base delay for exponential backoff
  circuitFailures: 5,      // Failures before circuit opens
  circuitCooldown: 30000,  // 30 second cooldown
};
```

### Per-Request Overrides
```typescript
// Custom timeout for specific operations
const config = {
  timeout: 10000,  // Override default timeout
};

// Apply custom config
const result = await api.get('/endpoint', config);
```

## Monitoring and Debugging

### Circuit Breaker Status
```typescript
const status = getCircuitBreakerStatus();
console.log('Circuit State:', status.state);
console.log('Failure Count:', status.failureCount);
console.log('Network Online:', status.isOnline);
console.log('Queued Requests:', status.queuedRequests);
```

### Request Logging
The system automatically logs:
- Successful requests after retries
- Circuit breaker state changes
- Network status changes
- Request queuing and execution

### Debug Mode
Enable detailed logging in development:
```typescript
// All retry attempts and circuit breaker actions are logged to console
// Look for these log patterns:
// ✅ API Success after 2 attempts: /customers
// 🔌 Circuit breaker opened due to failures
// 📶 Network status changed: offline
// 🔄 Executing queued request: POST /bills
```

## Performance Considerations

### Request Timing
- **Best case**: Single successful request (~100-500ms)
- **Retry case**: 1-3 attempts with exponential backoff (~3-15 seconds)
- **Circuit open**: Immediate failure (~1ms)
- **Offline queue**: Deferred execution until online

### Memory Usage
- Minimal overhead for retry mechanism
- Offline queue stores pending requests in memory
- Circuit breaker state uses negligible memory

### Network Efficiency
- Exponential backoff prevents server flooding
- Circuit breaker protects both client and server
- Offline detection prevents unnecessary requests

## Migration Guide

If upgrading from the old `withRetry` wrapper system:

### Before (Old System)
```typescript
const result = await withRetry(() => api.get('/customers'));
```

### After (New System)
```typescript
const result = await customersAPI.getAll(); // Automatic retry built-in
```

### With Custom Timeout
```typescript
const result = await customersAPI.getAll(undefined, 6000); // 6 second timeout
```

## Troubleshooting

### Common Issues

1. **Requests taking too long**
   - Check if circuit breaker is open
   - Verify network connectivity
   - Consider increasing timeout for complex operations

2. **Requests failing immediately**
   - Circuit breaker might be open (check status)
   - Network might be offline
   - Server might be returning 401 (auth issue)

3. **Memory usage growing**
   - Check offline queue size: `getCircuitBreakerStatus().queuedRequests`
   - Clear queue if necessary during extended offline periods

### Debug Commands
```typescript
// Check system status
console.log(getCircuitBreakerStatus());

// Manual circuit breaker reset (admin only)
import { resetCircuitBreaker } from '../lib/api';
resetCircuitBreaker();
```

## Conclusion

This enhanced API system provides enterprise-grade reliability with:
- Automatic failure recovery
- Server protection
- Network resilience
- Flexible timeout configuration
- Comprehensive monitoring

Use the appropriate timeout values for your operations and monitor the circuit breaker status to ensure optimal performance and user experience.