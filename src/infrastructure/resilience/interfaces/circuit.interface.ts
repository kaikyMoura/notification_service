import { CircuitStateEnum } from 'src/domain/enums/circuit-state.enum';
import { ICircuitStats } from './circuit-stats.interface';

export interface ICircuitBreaker {
  /**
   * Get the circuit state
   * @returns The circuit state
   */
  getState(): CircuitStateEnum;

  /**
   * Get the circuit statistics
   * @returns The circuit statistics
   */
  getStats(): ICircuitStats;

  /**
   * Reset the circuit
   */
  reset(): void;

  /**
   * Get the circuit names
   * @returns The circuit names
   */
  getNames(): string[];
}
