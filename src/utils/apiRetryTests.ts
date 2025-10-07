/**
 * API Retry Tests - Updated for Interceptor System
 * Tests the new axios interceptor-based retry mechanism
 */

import api, { customersAPI, billsAPI, analyticsAPI, getCircuitBreakerStatus, resetCircuitBreaker } from '../lib/api';

export class APIRetryTests {
  
  /**
   * Test basic retry functionality
   */
  static async testBasicRetry() {
    console.log('🧪 Testing basic retry mechanism...');
    
    try {
      const result = await customersAPI.getAll();
      console.log('✅ Request succeeded');
      return true;
    } catch (error: any) {
      console.log('❌ Request failed after retries:', error.message);
      return false;
    }
  }

  /**
   * Test dynamic timeout configuration
   */
  static async testDynamicTimeouts() {
    console.log('🧪 Testing dynamic timeout configuration...');
    
    try {
      // Test with short timeout
      await customersAPI.search('test', 1000);
      console.log('✅ Short timeout request completed');
      
      // Test with long timeout  
      await analyticsAPI.getSalesReport({}, 8000);
      console.log('✅ Long timeout request completed');
      
      return true;
    } catch (error: any) {
      console.log('❌ Timeout test failed:', error.message);
      return false;
    }
  }

  /**
   * Test circuit breaker functionality
   */
  static async testCircuitBreaker() {
    console.log('🧪 Testing circuit breaker...');
    
    resetCircuitBreaker();
    
    // Generate failures to trigger circuit breaker
    for (let i = 0; i < 6; i++) {
      try {
        await customersAPI.getById(`non-existent-${i}`);
      } catch (error: any) {
        // Expected to fail
      }
    }
    
    const status = getCircuitBreakerStatus();
    if (status.state === 'OPEN') {
      console.log('✅ Circuit breaker opened correctly');
      return true;
    } else {
      console.log('❌ Circuit breaker did not open');
      return false;
    }
  }

  /**
   * Run all tests
   */
  static async runAllTests() {
    console.log('🚀 Starting API retry mechanism tests\n');
    
    const tests = [
      { name: 'Basic Retry', fn: this.testBasicRetry },
      { name: 'Dynamic Timeouts', fn: this.testDynamicTimeouts },
      { name: 'Circuit Breaker', fn: this.testCircuitBreaker }
    ];
    
    const results: { name: string; passed: boolean }[] = [];
    
    for (const test of tests) {
      try {
        const passed = await test.fn();
        results.push({ name: test.name, passed });
        console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'PASSED' : 'FAILED'}\n`);
      } catch (error: any) {
        results.push({ name: test.name, passed: false });
        console.log(`❌ ${test.name}: ERROR - ${error.message}\n`);
      }
    }
    
    const passedCount = results.filter(r => r.passed).length;
    console.log(`🎯 Results: ${passedCount}/${results.length} tests passed`);
    
    return results;
  }
}

export default APIRetryTests;