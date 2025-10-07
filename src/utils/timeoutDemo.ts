/**
 * Timeout Demo - Updated for Interceptor System  
 * Demonstrates timeout behavior with the new API system
 */

import { customersAPI, billsAPI, analyticsAPI } from '../lib/api';

export const timeoutDemos = {
  
  /**
   * Demo: Default timeout behavior
   */
  async defaultTimeoutDemo() {
    console.log('🕐 Demo: Default timeout (4 seconds)');
    
    const startTime = Date.now();
    try {
      await customersAPI.getAll();
      const duration = Date.now() - startTime;
      console.log(`✅ Request completed in ${duration}ms`);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.log(`❌ Request failed after ${duration}ms`);
    }
  },

  /**
   * Demo: Short timeout for quick operations
   */
  async shortTimeoutDemo() {
    console.log('🕐 Demo: Short timeout (1 second)');
    
    const startTime = Date.now();
    try {
      await customersAPI.search('test', 1000);
      const duration = Date.now() - startTime;
      console.log(`✅ Quick operation completed in ${duration}ms`);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.log(`❌ Quick operation failed after ${duration}ms`);
    }
  },

  /**
   * Demo: Extended timeout for complex operations
   */
  async extendedTimeoutDemo() {
    console.log('🕐 Demo: Extended timeout (15 seconds)');
    
    const startTime = Date.now();
    try {
      await analyticsAPI.getSalesReport({}, 15000);
      const duration = Date.now() - startTime;
      console.log(`✅ Complex operation completed in ${duration}ms`);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.log(`❌ Complex operation failed after ${duration}ms`);
    }
  }
};

/**
 * Run timeout demonstrations
 */
export async function runTimeoutDemos() {
  console.log('🚀 Starting timeout demonstrations\n');
  
  const demos = [
    { name: 'Default Timeout', fn: timeoutDemos.defaultTimeoutDemo },
    { name: 'Short Timeout', fn: timeoutDemos.shortTimeoutDemo },
    { name: 'Extended Timeout', fn: timeoutDemos.extendedTimeoutDemo }
  ];

  for (const demo of demos) {
    try {
      console.log(`\n--- ${demo.name} ---`);
      await demo.fn();
    } catch (error: any) {
      console.log(`❌ ${demo.name} failed: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Timeout demonstrations completed!');
}

export default runTimeoutDemos;