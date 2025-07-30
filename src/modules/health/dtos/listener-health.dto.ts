import { BaseHealthDto } from './base-health.dto';

/**
 * @class ListenerHealthDto
 * @description DTO for listener health information
 */
export class ListenerHealthDto extends BaseHealthDto {
  readonly name: string;
  readonly enabled: boolean;
  readonly events: number;
  readonly status: 'active' | 'inactive' | 'error';
  readonly lastEventTime?: Date;

  constructor(
    name: string,
    enabled: boolean,
    events: number,
    status: 'active' | 'inactive' | 'error' = 'active',
    lastEventTime?: Date,
  ) {
    super();
    this.name = name;
    this.enabled = enabled;
    this.events = events;
    this.status = status;
    this.lastEventTime = lastEventTime;
  }

  /**
   * Check if listener is active
   * @returns boolean
   */
  isActive(): boolean {
    return this.enabled && this.status === 'active';
  }

  /**
   * Check if listener has processed events
   * @returns boolean
   */
  hasProcessedEvents(): boolean {
    return this.events > 0;
  }

  /**
   * Get listener efficiency (events per minute if lastEventTime is provided)
   * @returns number | undefined
   */
  getEfficiency(): number | undefined {
    if (!this.lastEventTime || this.events === 0) {
      return undefined;
    }

    const timeDiff = Date.now() - this.lastEventTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    return minutesDiff > 0 ? this.events / minutesDiff : undefined;
  }

  /**
   * Create active listener
   * @param name - Listener name
   * @param events - Number of events processed
   * @param lastEventTime - Last event time
   * @returns ListenerHealthDto
   */
  static active(name: string, events: number, lastEventTime?: Date): ListenerHealthDto {
    return new ListenerHealthDto(name, true, events, 'active', lastEventTime);
  }

  /**
   * Create inactive listener
   * @param name - Listener name
   * @param events - Number of events processed
   * @returns ListenerHealthDto
   */
  static inactive(name: string, events: number): ListenerHealthDto {
    return new ListenerHealthDto(name, false, events, 'inactive');
  }

  /**
   * Create error listener
   * @param name - Listener name
   * @param events - Number of events processed
   * @returns ListenerHealthDto
   */
  static error(name: string, events: number): ListenerHealthDto {
    return new ListenerHealthDto(name, true, events, 'error');
  }
}
