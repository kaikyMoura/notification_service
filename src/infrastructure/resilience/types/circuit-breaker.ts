import { CircuitStateEnum } from 'src/domain/enums/circuit-state.enum';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { CircuitBreakerOptions } from 'src/infrastructure/resilience/interfaces/circuit-breaker-opts.interface';
import { ICircuitStats } from '../interfaces/circuit-stats.interface';
import { ICircuitBreaker } from '../interfaces/circuit.interface';

/**
 * @class CircuitBreaker
 * @description Circuit breaker instance
 */
export class CircuitBreaker implements ICircuitBreaker {
  private state: CircuitStateEnum = CircuitStateEnum.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;
  private totalRequests = 0;

  constructor(
    private readonly name: string,
    private readonly options: CircuitBreakerOptions,
    private readonly logger: ILoggerService,
  ) {}

  /**
   * Execute the circuit breaker
   * @param operation - The operation to execute
   * @returns The result of the operation
   */
  execute<T>(operation: () => T): T {
    return operation();
  }

  /**
   * Get the circuit state
   * @returns The circuit state
   */
  getState(): CircuitStateEnum {
    this.log(`State: ${this.state}`);
    return this.state;
  }

  /**
   * Get the circuit statistics
   * @returns The circuit statistics
   */
  getStats(): ICircuitStats {
    this.log(`Stats: ${JSON.stringify(this.getStats())}`);
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
    };
  }

  /**
   * Reset the circuit
   */
  reset(): void {
    this.log(`Resetting circuit`);
    this.state = CircuitStateEnum.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.successCount = 0;
    this.totalRequests = 0;
  }

  /**
   * Get the circuit names
   * @returns The circuit names
   */
  getNames(): string[] {
    this.log(`Names: ${this.name}`);
    return [this.name];
  }

  private log(message: string): void {
    this.logger.log(`Circuit ${this.name} - ${message}`, 'CircuitBreaker');
  }
}
