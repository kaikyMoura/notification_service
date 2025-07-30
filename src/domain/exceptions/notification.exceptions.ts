/**
 * @class NotificationException
 * @description Base exception for notification errors
 */
export abstract class NotificationException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * @class EventEmissionException
 * @description Exception thrown when event emission fails
 */
export class EventEmissionException extends NotificationException {
  constructor(eventType: string, reason: string, metadata?: Record<string, any>) {
    super(`Failed to emit event ${eventType}: ${reason}`, 'EVENT_EMISSION_FAILED', 500, {
      eventType,
      reason,
      ...metadata,
    });
  }
}

/**
 * @class ListenerProcessingException
 * @description Exception thrown when listener processing fails
 */
export class ListenerProcessingException extends NotificationException {
  constructor(listenerName: string, eventType: string, reason: string, metadata?: Record<string, any>) {
    super(
      `Listener ${listenerName} failed to process event ${eventType}: ${reason}`,
      'LISTENER_PROCESSING_FAILED',
      500,
      { listenerName, eventType, reason, ...metadata },
    );
  }
}

/**
 * @class NotificationValidationException
 * @description Exception thrown when notification validation fails
 */
export class NotificationValidationException extends NotificationException {
  constructor(field: string, reason: string, metadata?: Record<string, any>) {
    super(`Notification validation failed for field ${field}: ${reason}`, 'NOTIFICATION_VALIDATION_FAILED', 400, {
      field,
      reason,
      ...metadata,
    });
  }
}

/**
 * @class ProviderException
 * @description Exception thrown when notification provider fails
 */
export class ProviderException extends NotificationException {
  constructor(provider: string, reason: string, metadata?: Record<string, any>) {
    super(`Provider ${provider} failed: ${reason}`, 'PROVIDER_FAILED', 500, { provider, reason, ...metadata });
  }
}

/**
 * @class BusinessEventValidationException
 * @description Exception thrown when business event validation fails
 */
export class BusinessEventValidationException extends NotificationException {
  constructor(eventType: string, field: string, reason: string, metadata?: Record<string, any>) {
    super(
      `Business event ${eventType} validation failed for field ${field}: ${reason}`,
      'BUSINESS_EVENT_VALIDATION_FAILED',
      400,
      { eventType, field, reason, ...metadata },
    );
  }
}

/**
 * @class RedisStreamsException
 * @description Exception thrown when Redis Streams operations fail
 */
export class RedisStreamsException extends NotificationException {
  constructor(operation: string, reason: string, metadata?: Record<string, any>) {
    super(`Redis Streams operation ${operation} failed: ${reason}`, 'REDIS_STREAMS_FAILED', 500, {
      operation,
      reason,
      ...metadata,
    });
  }
}
