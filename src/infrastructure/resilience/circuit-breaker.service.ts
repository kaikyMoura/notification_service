import { Inject, Injectable } from '@nestjs/common';
import { CircuitBreakerOptions } from 'src/infrastructure/resilience/interfaces/circuit-breaker-opts.interface';
import { CircuitBreaker } from './types/circuit-breaker';
import { ILoggerService } from '../logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from '../logger/logger.constants';

/**
 * @class CircuitBreakerService
 * @description Service for implementing circuit breaker pattern
 */
@Injectable()
export class CircuitBreakerService {
  private readonly circuits: Map<string, CircuitBreaker> = new Map();

  constructor(
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
  ) {}

  /**
   * Execute function with circuit breaker protection
   * @param circuitName - Name of the circuit
   * @param operation - Function to execute
   * @param options - Circuit breaker options
   * @returns T
   */
  execute<T>(
    circuitName: string,
    operation: () => T,
    options: CircuitBreakerOptions = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitorInterval: 10000, // 10 seconds
    },
  ): T {
    let circuit = this.circuits.get(circuitName);

    if (!circuit) {
      circuit = new CircuitBreaker(circuitName, options, this.logger);
      this.circuits.set(circuitName, circuit);
    }

    return circuit.execute(operation);
  }
}
