/**
 * @interface CircuitBreakerOptions
 * @description Circuit breaker configuration options
 */
export interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  expectedException?: string;
  monitorInterval?: number;
}
