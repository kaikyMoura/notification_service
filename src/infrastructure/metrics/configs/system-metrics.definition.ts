import { Gauge, Registry } from 'prom-client';

/**
 * @function getSystemMetricsDefinition
 * @description Get the system metrics definition and register them
 * @param registry - The registry to register the metrics
 * @returns SystemMetrics
 */
export function getSystemMetricsDefinition(registry: Registry) {
  const memoryUsage = new Gauge({
    name: 'system_memory_usage',
    help: 'Memory usage of the system',
  });
  const cpuUsage = new Gauge({
    name: 'system_cpu_usage',
    help: 'CPU usage of the system',
  });
  const requestCount = new Gauge({
    name: 'system_request_count',
    help: 'Request count of the system',
  });
  const errorRate = new Gauge({
    name: 'system_error_rate',
    help: 'Error rate of the system',
  });
  const averageResponseTime = new Gauge({
    name: 'system_average_response_time',
    help: 'Average response time of the system',
  });

  registry.registerMetric(memoryUsage);
  registry.registerMetric(cpuUsage);
  registry.registerMetric(requestCount);
  registry.registerMetric(errorRate);
  registry.registerMetric(averageResponseTime);

  return {
    memoryUsage,
    cpuUsage,
    requestCount,
    errorRate,
    averageResponseTime,
  };
}

/**
 * @type SystemMetrics
 * @description System metrics
 */
export type SystemMetrics = ReturnType<typeof getSystemMetricsDefinition>;
