# Notification Module - Architecture with Listeners and Events

## 🎧 **System of Listeners and Events**

The NotificationService now implements a **complete system of events and listeners**, allowing other services to subscribe to notification events without direct coupling.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend/     │    │   API Gateway   │    │   BullMQ        │
│   Other Service │    │   (Controller)  │    │   Processor     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Request       │    │   Redis Queue   │    │   Notification  │
│   (Sync/Async)  │    │   (BullMQ)      │    │   Service       │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Event Emitter │    │   Event         │
                       │   (Events)      │    │   Listeners     │
                       │                 │    │   (Actions)     │
                       └─────────────────┘    └─────────────────┘
```

## 🎯 **Main Improvements**

### ✅ **Event System**
- **EventEmitter2**: Robust event system
- **Typed Events**: TypeScript interfaces for all events
- **Structured Events**: Consistent and validated data
- **Asynchronous Events**: Non-blocking processing

### ✅ **Listener System**
- **Flexible Listeners**: Dynamic listener registration
- **Priorities**: Control execution order
- **Retry Logic**: Automatic retries with backoff
- **Enable/Disable**: Granular listener control

### ✅ **Advanced Monitoring**
- **Real-Time Metrics**: Detailed statistics
- **Structured Logs**: Complete tracking
- **Listeners Dashboard**: Management interface
- **Automatic Alerts**: Event notifications

## 🚀 **Available Endpoints**

### **Notifications**
- `POST /notifications/send` - Send notification (async)
- `POST /notifications/send-sync` - Send notification (sync)
- `POST /notifications/welcome-email` - Welcome email
- `POST /notifications/send-verification-code` - Verification code
- `POST /notifications/check-verification-code` - Check verification code
- `GET /notifications/queue/stats` - Queue statistics

### **Listeners**
- `GET /notification-listeners` - List all listeners
- `POST /notification-listeners/enable` - Enable listener
- `POST /notification-listeners/disable` - Disable listener
- `GET /notification-listeners/metrics` - Metrics
- `POST /notification-listeners/metrics/reset` - Reset metrics
- `GET /notification-listeners/event/:eventType` - Listeners by event

## 📊 **Event Types**

### **1. notification.sent**
```typescript
{
  eventType: 'notification.sent';
  id: string;
  userId: string;
  channel: NotificationChannelEnum;
  type: NotificationTypeEnum;
  title?: string;
  message?: string;
  email?: string;
  phone?: string;
  provider: string;
  providerMessageId?: string;
  deliveryTime: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

### **2. notification.failed**
```typescript
{
  eventType: 'notification.failed';
  id: string;
  userId: string;
  channel: NotificationChannelEnum;
  type: NotificationTypeEnum;
  title?: string;
  message?: string;
  email?: string;
  phone?: string;
  error: string;
  retryCount: number;
  maxRetries: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

### **3. notification.queued**
```typescript
{
  eventType: 'notification.queued';
  id: string;
  userId: string;
  channel: NotificationChannelEnum;
  type: NotificationTypeEnum;
  title?: string;
  message?: string;
  email?: string;
  phone?: string;
  queueId: string;
  priority: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

### **4. welcome.email.sent**
```typescript
{
  eventType: 'welcome.email.sent';
  id: string;
  userId: string;
  email: string;
  title: string;
  message: string;
  template: string;
  provider: string;
  channel: NotificationChannelEnum;
  type: NotificationTypeEnum;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

### **5. verification.code.sent**
```typescript
{
  eventType: 'verification.code.sent';
  id: string;
  userId: string;
  phoneNumber: string;
  expiresAt: Date;
  provider: string;
  channel: NotificationChannelEnum;
  type: NotificationTypeEnum;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

### **6. verification.code.verified**
```typescript
{
  eventType: 'verification.code.verified';
  id: string;
  userId: string;
  phoneNumber: string;
  verifiedAt: Date;
  channel: NotificationChannelEnum;
  type: NotificationTypeEnum;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

## 🔧 **Internal Architecture**

### **NotificationEventEmitterService**
```typescript
@Injectable()
export class NotificationEventEmitterService {
  async emitNotificationSent(eventData: {...}): Promise<void>
  async emitNotificationFailed(eventData: {...}): Promise<void>
  async emitNotificationQueued(eventData: {...}): Promise<void>
  async emitWelcomeEmailSent(eventData: {...}): Promise<void>
  async emitVerificationCodeSent(eventData: {...}): Promise<void>
  async emitVerificationCodeVerified(eventData: {...}): Promise<void>
}
```

### **NotificationListenerManagerService**
```typescript
@Injectable()
export class NotificationListenerManagerService {
  registerListener(listener: NotificationListener): void
  unregisterListener(listenerName: string): boolean
  enableListener(listenerName: string): boolean
  disableListener(listenerName: string): boolean
  getListeners(): NotificationListener[]
  getListenersForEvent(eventType: string): NotificationListener[]
  getListenerStatus(): Array<{...}>
}
```

### **AbstractNotificationListener**
```typescript
export abstract class AbstractNotificationListener {
  async handle(event: NotificationEventUnion): Promise<void>
  protected abstract processEvent(event: NotificationEventUnion): Promise<void>
  protected async handleError(event: NotificationEventUnion, error: Error): Promise<void>
  
  enable(): void
  disable(): void
  isEnabled(): boolean
  getPriority(): number
}
```

## 📈 **Listeners**

### **1. NotificationLoggerListener**
```typescript
@Injectable()
export class NotificationLoggerListener extends AbstractNotificationListener {
  // Structured logs for all events
  // Priority: 1 (high)
  // Events: All types
}
```

**Example of Log:**
```
✅ Notification sent successfully - User: 123, Channel: EMAIL, Type: INFO, Provider: SendGrid, DeliveryTime: 245ms
❌ Notification failed - User: 456, Channel: SMS, Type: ALERT, Error: Invalid phone number, RetryCount: 1/3
📋 Notification queued - User: 789, Channel: EMAIL, Type: SUCCESS, QueueId: notif_1234567890_abc123, Priority: 2
```

### **2. NotificationMetricsListener**
```typescript
@Injectable()
export class NotificationMetricsListener extends AbstractNotificationListener {
    // Real-time metrics
    // Priority: 2 (medium)
    // Events: All types
}
```

**Available Metrics:**
```typescript
{
  totalSent: number;
  totalFailed: number;
  totalQueued: number;
  welcomeEmailsSent: number;
  verificationCodesSent: number;
  verificationCodesVerified: number;
  averageDeliveryTime: number;
  successRate: number;
  lastUpdated: Date;
}
```

## 🎯 **How to Create a Custom Listener**

### **1. Create the Listener**
```typescript
@Injectable()
export class CustomNotificationListener extends AbstractNotificationListener {
  constructor() {
    super({
      name: 'CustomNotificationListener',
      eventTypes: ['notification.sent', 'notification.failed'],
      priority: 3,
      enabled: true,
      retryAttempts: 3,
      retryDelay: 1000,
    });
  }

  protected async processEvent(event: NotificationEventUnion): Promise<void> {
    switch (event.eventType) {
      case 'notification.sent':
        await this.handleNotificationSent(event);
        break;
      case 'notification.failed':
        await this.handleNotificationFailed(event);
        break;
    }
  }

  private async handleNotificationSent(event: NotificationSentEvent): Promise<void> {
    // Custom logic for notification sent
    console.log(`Custom handler: Notification sent to ${event.userId}`);
  }

  private async handleNotificationFailed(event: NotificationFailedEvent): Promise<void> {
    // Custom logic for notification failed
    console.log(`Custom handler: Notification failed for ${event.userId}: ${event.error}`);
  }
}
```

### **2. Register in the Module**
```typescript
@Module({
  providers: [
    // ... other providers
    CustomNotificationListener,
  ],
})
export class NotificationModule {}
```

### **3. Usar via API**
```bash
# Enable listener
POST /notification-listeners/enable
{
  "name": "CustomNotificationListener"
}

# Check status
GET /notification-listeners
```

## 📊 **Use Cases**

### **1. Listener for Analytics**
```typescript
@Injectable()
export class AnalyticsListener extends AbstractNotificationListener {
  constructor(private readonly analyticsService: AnalyticsService) {
    super({
      name: 'AnalyticsListener',
      eventTypes: ['notification.sent', 'welcome.email.sent'],
      priority: 2,
    });
  }

  protected async processEvent(event: NotificationEventUnion): Promise<void> {
    await this.analyticsService.trackNotificationEvent({
      userId: event.userId,
      eventType: event.eventType,
      channel: event.channel,
      timestamp: event.timestamp,
    });
  }
}
```

### **2. Listener for Cache**
```typescript
@Injectable()
export class CacheListener extends AbstractNotificationListener {
  constructor(private readonly cacheService: CacheService) {
    super({
      name: 'CacheListener',
      eventTypes: ['verification.code.verified'],
      priority: 1,
    });
  }

  protected async processEvent(event: NotificationEventUnion): Promise<void> {
    if (event.eventType === 'verification.code.verified') {
      await this.cacheService.invalidateUserCache(event.userId);
    }
  }
}
```

### **3. Listener for Webhooks**
```typescript
@Injectable()
export class WebhookListener extends AbstractNotificationListener {
  constructor(private readonly webhookService: WebhookService) {
    super({
      name: 'WebhookListener',
      eventTypes: ['notification.sent', 'notification.failed'],
      priority: 3,
    });
  }

  protected async processEvent(event: NotificationEventUnion): Promise<void> {
    await this.webhookService.sendWebhook({
      event: event.eventType,
      data: event,
      timestamp: event.timestamp,
    });
  }
}
```

## 🔄 **Event Flow**

### **1. Notification Sent**
```
NotificationService.send() 
  → emitNotificationQueued()
  → sendByChannel()
  → emitNotificationSent()
  → Listeners processam evento
```

### **2. Notification Failed**
```
NotificationService.send()
  → emitNotificationQueued()
  → sendByChannel() [ERRO]
  → emitNotificationFailed()
  → Listeners processam evento
```

### **3. Verification Code**
```
NotificationService.sendVerificationCode()
  → twilioNotifier.sendVerificationCode()
  → emitVerificationCodeSent()
  → Listeners processam evento
```

## 📈 **Advantages of Listeners**

### ✅ **Decoupling**
- **No Direct Dependencies**: Listeners do not know the NotificationService
- **Dynamic Registration**: Listeners can be added/removed at runtime
- **Flexibility**: Each listener can implement its own logic

### ✅ **Scalability**
- **Parallel Processing**: Multiple listeners execute simultaneously
- **Priorities**: Control execution order
- **Retry Logic**: Automatic retries for failures

### ✅ **Monitoring**
- **Detailed Metrics**: Real-time statistics
- **Structured Logs**: Complete tracking
- **Dashboard**: Management interface

### ✅ **Extensibilidade**
- **Easy Addition**: New listeners without modifying existing code
- **Plugins**: Listeners can be distributed as plugins
- **Configuration**: Granular control via API

## 🏆 **Conclusion**

The listener system offers:

- **🎧 Robust Events**: Complete typed event system
- **🔄 Flexible Listeners**: Dynamic registration and granular control
- **📊 Advanced Monitoring**: Real-time metrics and logs
- **🛠️ Extensibility**: Easy addition of new behaviors
- **📈 Scalability**: Parallel processing and priorities

**Result**: Professional notification system with events and listeners! 🚀 