import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEventUnion } from 'src/domain/interfaces/notification-event.interface';
import { NotificationListener } from 'src/domain/interfaces/notification-listener.interface';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { SUPPORTED_EVENTS } from '../configs/supported-events';

export interface ListenerRegistration {
  listener: NotificationListener;
  eventTypes: string[];
  priority: number;
}

@Injectable()
export class NotificationListenerManagerService implements OnModuleInit {
  private readonly listeners = new Map<string, ListenerRegistration>();
  private readonly eventHandlers = new Map<string, NotificationListener[]>();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
  ) {}

  /**
   * @method onModuleInit
   * @description Initialize the listener manager
   */
  onModuleInit(): void {
    this.logger.log('[NotificationManager] Initializing...');
    this.bindAllSupportedEvents();
  }

  /**
   * @method registerListener
   * @description Register a listener
   * @param listener - The listener to register
   */
  registerListener(listener: NotificationListener): void {
    const name = listener.getName();
    const registration: ListenerRegistration = {
      listener,
      eventTypes: listener.getEventTypes(),
      priority: listener.getPriority(),
    };

    this.listeners.set(name, registration);
    this.refreshEventHandlers();

    this.logger.log(`Registered listener: ${name}`, 'NotificationListenerManagerService.registerListener');
  }

  /**
   * @method unregisterListener
   * @description Unregister a listener
   * @param listenerName - The name of the listener to unregister
   * @returns boolean
   */
  unregisterListener(listenerName: string): boolean {
    const wasRemoved = this.listeners.delete(listenerName);
    if (wasRemoved) {
      this.refreshEventHandlers();
      this.logger.log(`Unregistered: ${listenerName}`, 'NotificationListenerManagerService.unregisterListener');
    }
    return wasRemoved;
  }

  /**
   * @method enableListener
   * @description Enable a listener
   * @param listenerName - The name of the listener to enable
   * @returns boolean
   */
  enableListener(listenerName: string): boolean {
    const registration = this.listeners.get(listenerName);
    if (!registration) return false;

    registration.listener.enable();
    this.logger.log(`Enabled: ${listenerName}`, 'NotificationListenerManagerService.enableListener');
    return true;
  }

  /**
   * @method disableListener
   * @description Disable a listener
   * @param listenerName - The name of the listener to disable
   * @returns boolean
   */
  disableListener(listenerName: string): boolean {
    const registration = this.listeners.get(listenerName);
    if (!registration) return false;

    registration.listener.disable();
    this.logger.log(`Disabled: ${listenerName}`, 'NotificationListenerManagerService.disableListener');
    return true;
  }

  /**
   * @method getListeners
   * @description Get all listeners
   * @returns NotificationListener[]
   */
  getListeners(): NotificationListener[] {
    return Array.from(this.listeners.values(), r => r.listener);
  }

  /**
   * @method getListenersForEvent
   * @description Get listeners for an event
   * @param eventType - The type of event
   * @returns NotificationListener[]
   */
  getListenersForEvent(eventType: string): NotificationListener[] {
    return this.eventHandlers.get(eventType) ?? [];
  }

  /**
   * @method getListenerStatus
   * @description Get the status of all listeners
   * @returns Array<{ name: string; eventTypes: string[]; enabled: boolean; priority: number }>
   */
  getListenerStatus(): Array<{
    name: string;
    eventTypes: string[];
    enabled: boolean;
    priority: number;
  }> {
    return Array.from(this.listeners.values(), ({ listener }) => ({
      name: listener.getName(),
      eventTypes: listener.getEventTypes(),
      enabled: listener.isEnabled(),
      priority: listener.getPriority(),
    }));
  }

  /**
   * @method bindAllSupportedEvents
   * @description Bind all supported events
   */
  private bindAllSupportedEvents(): void {
    for (const eventType of SUPPORTED_EVENTS) {
      this.eventEmitter.on(eventType, (event: NotificationEventUnion) => {
        void this.dispatchToListeners(event);
      });
    }

    this.logger.log(
      `Bound to events: ${SUPPORTED_EVENTS.join(', ')}`,
      'NotificationListenerManagerService.bindAllSupportedEvents',
    );
  }

  /**
   * @method dispatchToListeners
   * @description Dispatch an event to all listeners
   * @param event - The event to dispatch
   */
  private async dispatchToListeners(event: NotificationEventUnion): Promise<void> {
    const listeners = this.getListenersForEvent(event.eventType);
    if (listeners.length === 0) {
      this.logger.log(`No listeners for: ${event.eventType}`, 'NotificationListenerManagerService.dispatchToListeners');
      return;
    }

    this.logger.log(
      `Dispatching '${event.eventType}' to ${listeners.length} listeners`,
      'NotificationListenerManagerService.dispatchToListeners',
    );

    await Promise.allSettled(
      listeners.map(listener =>
        listener.handle(event).catch(err => {
          this.logger.error(
            `Listener ${listener.getName()} failed on '${event.eventType}': ${err}`,
            'NotificationListenerManagerService.dispatchToListeners',
          );
        }),
      ),
    );
  }

  /**
   * @method refreshEventHandlers
   * @description Refresh the event handlers
   */
  private refreshEventHandlers(): void {
    this.eventHandlers.clear();

    for (const { listener, eventTypes } of this.listeners.values()) {
      for (const eventType of eventTypes) {
        if (!this.eventHandlers.has(eventType)) {
          this.eventHandlers.set(eventType, []);
        }
        this.eventHandlers.get(eventType)!.push(listener);
      }
    }

    for (const handlers of this.eventHandlers.values()) {
      handlers.sort((a, b) => a.getPriority() - b.getPriority());
    }
  }
}
