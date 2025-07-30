/**
 * @interface RequestMetrics
 * @description Interface for request metrics
 */
export interface RequestMetrics {
  method: string;
  route: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent: string;
  userId: string;
}
