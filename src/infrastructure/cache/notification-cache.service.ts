import { CacheOptions } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ILoggerService } from '../logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from '../logger/logger.constants';
import { ICacheItem, ICacheOptions } from './interfaces/cache-item.interface';

/**
 * @class NotificationCacheService
 * @description Intelligent caching service for notification system
 */
@Injectable()
export class NotificationCacheService {
  private readonly cache = new Map<string, ICacheItem<any>>();
  private readonly defaultOptions: ICacheOptions = {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000,
    checkPeriod: 60 * 1000, // 1 minute
  };

  constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService) {
    this.startCleanup();
  }

  /**
   * Get item from cache
   * @param key - Cache key
   * @returns T | null
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.logger.debug(`Cache miss for key: ${key}`, 'NotificationCacheService.get');
      return null;
    }

    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.logger.debug(`Cache item expired for key: ${key}`, 'NotificationCacheService.get');
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();

    this.logger.debug(`Cache hit for key: ${key}`, 'NotificationCacheService.get');
    return item.value as T;
  }

  /**
   * Set item in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param options - Cache options
   */
  set<T>(key: string, value: T, options?: Partial<CacheOptions>): void {
    const mergedOptions = { ...this.defaultOptions, ...options };

    // Check if cache is full
    if (this.cache.size >= mergedOptions.maxSize!) {
      this.evictLeastUsed();
    }

    const item: ICacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: mergedOptions.ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, item);
    this.logger.debug(`Cached item with key: ${key}, TTL: ${mergedOptions.ttl}ms`, 'NotificationCacheService.set');
  }

  /**
   * Check if key exists in cache
   * @param key - Cache key
   * @returns boolean
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (this.isExpired(item)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete item from cache
   * @param key - Cache key
   * @returns boolean
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Deleted cache item with key: ${key}`, 'NotificationCacheService.delete');
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.logger.log('Cache cleared', 'NotificationCacheService.clear');
  }

  /**
   * Get cache size
   * @returns number
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats() {
    const items = Array.from(this.cache.values());

    const stats = {
      totalItems: this.cache.size,
      expiredItems: items.filter(item => this.isExpired(item)).length,
      averageAccessCount: items.length > 0 ? items.reduce((sum, item) => sum + item.accessCount, 0) / items.length : 0,
      oldestItem: items.length > 0 ? Math.min(...items.map(item => item.timestamp)) : null,
      newestItem: items.length > 0 ? Math.max(...items.map(item => item.timestamp)) : null,
      memoryUsage: this.estimateMemoryUsage(),
    };

    return stats;
  }

  /**
   * Get cache keys
   * @returns string[]
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache values
   * @returns any[]
   */
  values(): unknown[] {
    return Array.from(this.cache.values()).map(item => item.value as unknown);
  }

  /**
   * Get cache entries
   * @returns Array<[string, any]>
   */
  entries(): Array<[string, unknown]> {
    return Array.from(this.cache.entries()).map(([key, item]) => [key, item.value]);
  }

  /**
   * Check if item is expired
   * @param item - Cache item
   * @returns boolean
   */
  private isExpired(item: ICacheItem<unknown>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * Evict least used item from cache
   */
  private evictLeastUsed(): void {
    let leastUsed: ICacheItem<unknown> | null = null;
    let minScore = Infinity;

    for (const item of this.cache.values()) {
      // Calculate score based on access count and last access time
      const timeSinceLastAccess = Date.now() - item.lastAccessed;
      const score = item.accessCount === 0 ? timeSinceLastAccess : timeSinceLastAccess / item.accessCount;

      if (score < minScore) {
        minScore = score;
        leastUsed = item;
      }
    }

    if (leastUsed) {
      this.cache.delete(leastUsed.key);
      this.logger.debug(`Evicted least used cache item: ${leastUsed.key}`, 'NotificationCacheService.evictLeastUsed');
    }
  }

  /**
   * Start periodic cleanup of expired items
   */
  private startCleanup(): void {
    setInterval(() => {
      const beforeSize = this.cache.size;

      for (const [key, item] of this.cache.entries()) {
        if (this.isExpired(item)) {
          this.cache.delete(key);
        }
      }

      const afterSize = this.cache.size;
      const cleaned = beforeSize - afterSize;

      if (cleaned > 0) {
        this.logger.debug(`Cleaned up ${cleaned} expired cache items`, 'NotificationCacheService.startCleanup');
      }
    }, this.defaultOptions.checkPeriod);
  }

  /**
   * Estimate memory usage of cache
   * @returns number - Estimated memory usage in bytes
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;

    for (const [key, item] of this.cache.entries()) {
      // Estimate size of key
      totalSize += key.length * 2; // UTF-16 characters

      // Estimate size of value (rough approximation)
      const valueStr = JSON.stringify(item.value);
      totalSize += valueStr.length * 2;

      // Add overhead for CacheItem structure
      totalSize += 100; // Rough estimate for object overhead
    }

    return totalSize;
  }

  /**
   * Cache template data with intelligent TTL
   * @param templateName - Template name
   * @param data - Template data
   * @param ttl - Time to live in milliseconds
   */
  cacheTemplate(templateName: string, data: unknown, ttl?: number): void {
    const key = `template:${templateName}`;
    this.set(key, data, { ttl: ttl || 30 * 60 * 1000 }); // 30 minutes default
  }

  /**
   * Get cached template data
   * @param templateName - Template name
   * @returns unknown
   */
  getTemplate(templateName: string): unknown {
    const key = `template:${templateName}`;
    return this.get(key);
  }

  /**
   * Cache user preferences
   * @param userId - User ID
   * @param preferences - User preferences
   * @param ttl - Time to live in milliseconds
   */
  cacheUserPreferences(userId: string, preferences: unknown, ttl?: number): void {
    const key = `user_prefs:${userId}`;
    this.set(key, preferences, { ttl: ttl || 60 * 60 * 1000 }); // 1 hour default
  }

  /**
   * Get cached user preferences
   * @param userId - User ID
   * @returns unknown
   */
  getUserPreferences(userId: string): unknown {
    const key = `user_prefs:${userId}`;
    return this.get(key);
  }

  /**
   * Cache provider configuration
   * @param provider - Provider name
   * @param config - Provider configuration
   * @param ttl - Time to live in milliseconds
   */
  cacheProviderConfig(provider: string, config: unknown, ttl?: number): void {
    const key = `provider_config:${provider}`;
    this.set(key, config, { ttl: ttl || 24 * 60 * 60 * 1000 }); // 24 hours default
  }

  /**
   * Get cached provider configuration
   * @param provider - Provider name
   * @returns unknown | null
   */
  getProviderConfig(provider: string): unknown {
    const key = `provider_config:${provider}`;
    return this.get(key);
  }
}
