import { CircuitStateEnum } from 'src/domain/enums/circuit-state.enum';

/**
 * @interface ICircuitStats
 * @description Circuit stats interface
 */
export interface ICircuitStats {
  state: CircuitStateEnum;
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
  totalRequests: number;
}
