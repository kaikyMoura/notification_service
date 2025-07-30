import { Counter, Gauge, Histogram, Registry } from 'prom-client';

/**
 * @function getNotificationMetricsDefinition
 * @description Get the notification-specific metrics definition and register them
 * @param registry - The registry to register the metrics to
 * @returns NotificationMetrics
 */
export function getNotificationMetricsDefinition(registry: Registry) {
  const totalSent = new Counter({
    name: 'notifications_sent_total',
    help: 'Total number of notifications sent',
    labelNames: ['channel', 'type', 'provider'],
  });

  const totalFailed = new Counter({
    name: 'notifications_failed_total',
    help: 'Total number of notifications that failed',
    labelNames: ['channel', 'type', 'provider', 'error_type'],
  });

  const totalQueued = new Counter({
    name: 'notifications_queued_total',
    help: 'Total number of notifications queued',
    labelNames: ['channel', 'type', 'priority'],
  });

  const deliveryTime = new Histogram({
    name: 'notification_delivery_time_seconds',
    help: 'Time taken to deliver notifications',
    labelNames: ['channel', 'type', 'provider'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  });

  const activeListeners = new Gauge({
    name: 'notification_active_listeners',
    help: 'Number of active notification listeners',
    labelNames: ['listener_type', 'event_type'],
  });

  const providerHealth = new Gauge({
    name: 'notification_provider_health',
    help: 'Health status of notification providers (0=down, 1=up)',
    labelNames: ['provider', 'endpoint'],
  });

  const queueSize = new Gauge({
    name: 'notification_queue_size',
    help: 'Current size of notification queues',
    labelNames: ['queue_name', 'priority'],
  });

  const successRate = new Gauge({
    name: 'notification_success_rate',
    help: 'Success rate of notifications',
    labelNames: ['channel', 'type', 'provider'],
  });

  const lastUpdated = new Gauge({
    name: 'notification_last_updated',
    help: 'Last updated timestamp',
  });

  const welcomeEmailsSent = new Counter({
    name: 'welcome_emails_sent',
    help: 'Total number of welcome emails sent',
  });

  const verificationCodesSent = new Counter({
    name: 'verification_codes_sent',
    help: 'Total number of verification codes sent',
  });

  const verificationCodesVerified = new Counter({
    name: 'verification_codes_verified',
    help: 'Total number of verification codes verified',
  });

  // Registrar todas as métricas no registry
  registry.registerMetric(totalSent);
  registry.registerMetric(totalFailed);
  registry.registerMetric(totalQueued);
  registry.registerMetric(deliveryTime);
  registry.registerMetric(activeListeners);
  registry.registerMetric(providerHealth);
  registry.registerMetric(queueSize);
  registry.registerMetric(successRate);
  registry.registerMetric(lastUpdated);
  registry.registerMetric(welcomeEmailsSent);
  registry.registerMetric(verificationCodesSent);
  registry.registerMetric(verificationCodesVerified);

  // Retornar o objeto com todas as métricas registradas
  return {
    totalSent,
    totalFailed,
    totalQueued,
    deliveryTime,
    activeListeners,
    providerHealth,
    queueSize,
    successRate,
    lastUpdated,
    welcomeEmailsSent,
    verificationCodesSent,
    verificationCodesVerified,
  };
}

/**
 * @type NotificationMetrics
 * @description Type for notification-specific metrics
 */
export type NotificationMetrics = ReturnType<typeof getNotificationMetricsDefinition>;
