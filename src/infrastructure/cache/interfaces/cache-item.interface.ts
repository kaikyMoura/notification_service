/**
 * @interface ICacheItem<T>
 * @description Cache item interface
 */
export interface ICacheItem<T> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * @interface ICacheOptions
 * @description Cache configuration options
 */
export interface ICacheOptions {
  ttl: number;
  maxSize?: number;
  checkPeriod?: number;
}
