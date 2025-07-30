import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ILoggerService } from '../logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from '../logger/logger.constants';

/**
 * @interface StreamMessage
 * @description Interface for stream messages
 */
export interface StreamMessage {
  id: string;
  eventType: string;
  data: Record<string, any>;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * @interface ConsumerGroup
 * @description Interface for consumer group configuration
 */
export interface ConsumerGroup {
  name: string;
  consumer: string;
  stream: string;
}

/**
 * @class RedisStreamsService
 * @description Service for Redis Streams messaging
 */
@Injectable()
export class RedisStreamsService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly consumerGroups: Map<string, ConsumerGroup> = new Map();
  private readonly pollingTasks: Map<string, NodeJS.Timeout> = new Map();
  private readonly listeners: Map<string, (message: StreamMessage) => Promise<void>> = new Map();

  constructor(
    private readonly configService: ConfigService,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
  ) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      maxRetriesPerRequest: 3,
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis Streams', 'RedisStreamsService.constructor');
    });
    this.redis.on('error', error => {
      this.logger.error(`Redis connection error: ${error.message}`, 'RedisStreamsService.constructor');
    });
  }

  /**
   * Publish message to stream
   * @param stream - Stream name
   * @param eventType - Event type
   * @param data - Message data
   * @param metadata - Optional metadata
   * @returns Promise<string> - Message ID
   */
  async publish(
    stream: string,
    eventType: string,
    data: Record<string, any>,
    metadata?: Record<string, any>,
  ): Promise<string> {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const timestamp = Date.now();
    const entry: Record<string, string> = {
      id,
      eventType,
      data: JSON.stringify(data),
      timestamp: timestamp.toString(),
      metadata: JSON.stringify(metadata || {}),
    };
    try {
      // ioredis xadd expects a flat list of key, value, key, value...
      const flatEntry: string[] = [];
      for (const [key, value] of Object.entries(entry)) {
        flatEntry.push(key, value);
      }
      const result = await this.redis.xadd(stream, '*', ...flatEntry);

      if (!result) {
        this.logger.error(`Failed to publish message to stream ${stream}: ${eventType}`, 'RedisStreamsService.publish');
        throw new Error('Failed to publish message to stream');
      }

      this.logger.log(`Published message to stream ${stream}: ${eventType}`, '[RedisStreamsService]');
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to publish message to stream ${stream}: ${eventType} ${error}`,
        'RedisStreamsService.publish',
      );
      throw error;
    }
  }

  /**
   * Create consumer group
   * @param stream - Stream name
   * @param groupName - Consumer group name
   * @returns Promise<void>
   */
  async createConsumerGroup(stream: string, group: string): Promise<void> {
    try {
      await this.redis.xgroup('CREATE', stream, group, '$', 'MKSTREAM');
      this.logger.log(`Group ${group} created on stream ${stream}`, 'RedisStreamsService.createConsumerGroup');
    } catch (err) {
      if (!(err as Error).message.includes('BUSYGROUP')) {
        this.logger.error(
          `Failed to create group ${group} on stream ${stream}: ${(err as Error).message}`,
          'RedisStreamsService.createConsumerGroup',
        );
        throw err;
      }
      this.logger.log(`Group ${group} already exists on stream ${stream}`, 'RedisStreamsService.createConsumerGroup');
    }
  }

  /**
   * Subscribe to stream with consumer group
   * @param stream - Stream name
   * @param groupName - Consumer group name
   * @param consumerName - Consumer name
   * @param handler - Message handler function
   * @param batchSize - Number of messages to process in batch
   * @param blockTime - Block time in milliseconds
   * @returns Promise<void>
   */
  async subscribe(
    stream: string,
    group: string,
    consumerName: string,
    handler: (message: StreamMessage) => Promise<void>,
    batchSize: number = 10,
    blockTime: number = 5000,
  ): Promise<void> {
    const key = `${stream}:${group}:${consumerName}`;
    await this.createConsumerGroup(stream, group);
    this.listeners.set(key, handler);

    const schedule = () => this.pollingTasks.set(key, setTimeout(poll, 100) as unknown as NodeJS.Timeout);
    schedule();

    const poll = async (): Promise<void> => {
      try {
        const result = await this.redis.xreadgroup(
          'GROUP',
          group,
          consumerName,
          'COUNT',
          batchSize,
          'BLOCK',
          blockTime,
          'STREAMS',
          stream,
          '>',
        );
        if (!result) return;

        for (const [, entries] of result as [string, Record<string, any>[]][]) {
          for (const [id, fields] of entries as [string, Record<string, any>][]) {
            const message = this.parseMessage(id, fields);
            try {
              await handler(message);
              await this.redis.xack(stream, group, id);
              this.logger.log(`Acked ${id}`, 'RedisStreamsService.subscribe');
            } catch (err) {
              await this.moveToDeadLetter(stream, group, id, err);
              this.logger.error(`Handler failed for ${id}`, 'RedisStreamsService.subscribe', err);
            }
          }
        }
      } catch (error) {
        this.logger.error(`Error polling stream ${stream}: ${error}`, 'RedisStreamsService.subscribe');
      } finally {
        schedule();
      }
    };
  }

  /**
   * Parse message from Redis Streams
   * @param id - Message ID
   * @param fields - Message fields
   * @returns StreamMessage
   */
  private parseMessage(id: string, fields: Record<string, any>): StreamMessage {
    const get = (key: string) => fields[fields.findIndex((f: string) => f === key) + 1] as string;
    return {
      id: get('id') || id,
      eventType: get('eventType'),
      data: JSON.parse(get('data')),
      timestamp: parseInt(get('timestamp'), 10),
      metadata: JSON.parse(get('metadata')),
    };
  }

  /**
   * Move message to dead letter stream
   * @param stream - Stream name
   * @param group - Consumer group name
   * @param messageId - Message ID
   * @param error - Error
   * @returns Promise<void>
   */
  private async moveToDeadLetter(stream: string, group: string, messageId: string, error: Error): Promise<void> {
    try {
      const [entry] = await this.redis.xrange(stream, messageId, messageId);
      if (!entry) return;
      const [, fields] = entry;

      const deadLetter = `${stream}:dead-letter`;
      await this.redis.xadd(
        deadLetter,
        '*',
        ...Object.entries({
          originalStream: stream,
          originalGroup: group,
          originalMessageId: messageId,
          error: error.message,
          timestamp: Date.now().toString(),
        }).flat(),
        ...fields,
      );

      this.logger.log(`Moved ${messageId} to ${deadLetter}`, 'RedisStreamsService.moveToDeadLetter');
    } catch (err) {
      this.logger.error(`Dead letter failed for ${messageId}. Error: ${err}`, 'RedisStreamsService.moveToDeadLetter');
    }
  }

  /**
   * On module destroy
   * @returns Promise<void>
   */
  async onModuleDestroy(): Promise<void> {
    this.pollingTasks.forEach((timeout, key) => {
      clearTimeout(timeout);
      this.logger.log(`Stopped polling ${key}`, 'RedisStreamsService.onModuleDestroy');
    });
    await this.redis.quit();
    this.logger.log('Redis connection closed', 'RedisStreamsService.onModuleDestroy');
  }

  /**
   * Get stream info
   * @param stream - Stream name
   * @returns Promise<any>
   */
  async getStreamInfo(stream: string): Promise<any> {
    return this.redis.xinfo('STREAM', stream);
  }

  /**
   * Get consumer group info
   * @param stream - Stream name
   * @param group - Consumer group name
   * @returns Promise<any>
   */
  async getConsumerGroupInfo(stream: string, group: string): Promise<any> {
    const groups = await this.redis.xinfo('GROUPS', stream);
    return (groups as any[]).find((g: any) => g[1] === group);
  }

  /**
   * Get pending messages
   * @param stream - Stream name
   * @param group - Consumer group name
   * @returns Promise<any>
   */
  async getPendingMessages(stream: string, group: string): Promise<any> {
    return this.redis.xpending(stream, group);
  }
}
