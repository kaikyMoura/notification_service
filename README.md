<div align="center">

# 🔔 Notification Service API

**Notification Service** is a robust, scalable notification backend for modern applications. It provides comprehensive notification delivery across multiple channels (Email, SMS, Push, In-App), event-driven architecture with listeners, queue management, and real-time monitoring. Built with NestJS, TypeScript, Prisma, Redis, and BullMQ, it is designed for high-performance, reliable notification delivery with advanced features like scheduling, retry logic, and comprehensive analytics.

</div>

<div align="center">

![GitHub top language](https://img.shields.io/github/languages/top/kaikyMoura/notification_service)
![Repository size](https://img.shields.io/github/repo-size/kaikyMoura/notification_service)
![Github last commit](https://img.shields.io/github/last-commit/kaikyMoura/notification_service)
![License](https://img.shields.io/badge/license-UNLICENSED-blue)
![Languages count](https://img.shields.io/github/languages/count/kaikyMoura/notification_service)

</div>

---

## 1. About the Project

Notification Service is a secure, scalable, and extensible notification delivery API, ideal for microservices and modern web/mobile applications. It features multi-channel notification delivery (Email via SendGrid, SMS via Twilio, Push notifications, and In-App notifications), event-driven architecture with listeners, queue management with BullMQ, and comprehensive monitoring. The service is built with NestJS, Prisma, Redis, and BullMQ for high performance and reliability.

### 🏗️ **Architecture Highlights**

- **Event-Driven Architecture**: Complete system of events and listeners for decoupled processing
- **Multi-Channel Delivery**: Support for Email, SMS, Push, and In-App notifications
- **Queue Management**: BullMQ-based job processing with retry logic and priority handling
- **Clean Architecture**: Separation of concerns with domain, application, and infrastructure layers
- **Microservices Ready**: Redis-based microservice communication
- **Type Safety**: Full TypeScript implementation with strict validation
- **Security First**: Comprehensive security measures and best practices

---

## 2. Features

### 🔔 **Notification Delivery**
- **Multi-Channel Support**: Email (SendGrid), SMS (Twilio), Push, and In-App notifications
- **Scheduled Notifications**: Future-dated notification delivery
- **Batch Processing**: Efficient bulk notification sending
- **Template Support**: Predefined notification templates
- **Verification Codes**: SMS/Email verification with expiration
- **Welcome Emails**: Automated welcome email sequences

### 🎧 **Event System & Listeners**
- **EventEmitter2**: Robust event system with typed events
- **Flexible Listeners**: Dynamic listener registration and management
- **Event Types**: `notification.sent`, `notification.failed`, `notification.queued`, `welcome.email.sent`, `verification.code.sent`, `verification.code.verified`
- **Listener Priorities**: Control execution order
- **Retry Logic**: Automatic retries with exponential backoff
- **Enable/Disable**: Granular listener control

### 🚀 **Queue Management**
- **BullMQ Integration**: Redis-based job queue processing
- **Priority Queues**: High-priority notification handling
- **Retry Mechanisms**: Configurable retry policies
- **Queue Monitoring**: Real-time queue statistics and metrics
- **Job Scheduling**: Delayed and recurring job support

### 🛡️ **API Protection & Security**
- **JWT Authentication**: Secure API access with token validation
- **Rate Limiting**: Throttler protection against abuse
- **CORS Configuration**: Environment-based origin control
- **Helmet Security**: Security headers and protection
- **Audit Logging**: Comprehensive audit trail for all operations
- **Input Validation**: Class-validator with custom decorators

### 📈 **Observability & Monitoring**
- **Health Endpoints**: Health, readiness, and liveness probes
- **Real-Time Metrics**: Detailed notification and listener statistics
- **Structured Logging**: Winston-based logging with context
- **Memory Monitoring**: Application performance tracking
- **Swagger Documentation**: Comprehensive API documentation
- **Queue Dashboard**: BullMQ monitoring interface
- **Prometheus**: Metrics for monitoring and alerting

### 🔧 **Advanced Features**
- **Circuit Breaker**: Resilience patterns for external services
- **Caching**: Redis-based caching for performance
- **Microservices**: Redis-based inter-service communication
- **Scheduled Tasks**: Automated maintenance and cleanup
- **Environment Configuration**: Joi-based environment validation

---

## 3. Technologies

- **NestJS** (Node.js framework)
- **TypeScript** (with strict configuration)
- **Prisma** (ORM with PostgreSQL)
- **PostgreSQL** (primary database)
- **Redis** (cache, queue, and microservice communication)
- **BullMQ** (job queue management)
- **SendGrid** (email delivery)
- **Twilio** (SMS delivery)
- **JWT** (authentication)
- **EventEmitter2** (event system)
- **Jest** (testing framework)
- **ESLint/Prettier** (code quality and formatting)
- **Winston** (structured logging)
- **Helmet** (security headers)
- **Compression** (response compression)

---

## 4. Installation

### Prerequisites
- **Node.js** 18+
- **PostgreSQL** 14+
- **Redis** (for caching, queues, and microservices)
- **pnpm** (recommended package manager)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/kaikyMoura/notification_service.git
cd notification_service

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Set up database
pnpm db:generate
pnpm db:migrate

# 5. Start development server
pnpm start:dev
```

---

## 5. Environment Setup

### Required Environment Variables

```env
# Application
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/notification_service"

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379
REDIS_TTL=300
REDIS_MAX_ITEMS=100

# JWT Configuration
JWT_SECRET_KEY=your_super_secret_jwt_key_here_minimum_32_characters
JWT_ACCESS_EXPIRES=1h
JWT_REFRESH_EXPIRES=7d

# Rate Limiting
THROTTLER_TTL=60
THROTTLER_LIMIT=10

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# SendGrid (Email)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Queue Configuration
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_PASSWORD=
QUEUE_REDIS_DB=1

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

#### Environment Variables Explained
- **NODE_ENV**: Application environment (`development`, `production`, `test`)
- **PORT**: Port where the server will listen
- **DATABASE_URL**: PostgreSQL connection string
- **REDIS_HOST/PORT**: Redis connection details for caching and queues
- **JWT_SECRET_KEY**: Secret key for signing JWT tokens (use a strong, unique value)
- **SENDGRID_API_KEY**: SendGrid API key for email delivery
- **TWILIO_ACCOUNT_SID/AUTH_TOKEN**: Twilio credentials for SMS delivery
- **THROTTLER_TTL/LIMIT**: Rate limiting configuration
- **ALLOWED_ORIGINS**: Comma-separated list of allowed CORS origins
- **QUEUE_REDIS_***: Redis configuration for BullMQ queues

---

## 6. API Documentation

- **Swagger UI:** [http://localhost:5000/docs](http://localhost:5000/docs)

### Main Endpoints

#### Notifications
- `POST /notifications/send` — Send notification (async)
- `POST /notifications/send-sync` — Send notification (sync)
- `POST /notifications/welcome-email` — Send welcome email
- `POST /notifications/send-verification-code` — Send verification code
- `POST /notifications/check-verification-code` — Verify code
- `GET /notifications/queue/stats` — Queue statistics

#### Listeners Management
- `GET /notification-listeners` — List all listeners
- `POST /notification-listeners/enable` — Enable listener
- `POST /notification-listeners/disable` — Disable listener
- `GET /notification-listeners/metrics` — Listener metrics
- `POST /notification-listeners/metrics/reset` — Reset metrics
- `GET /notification-listeners/event/:eventType` — Listeners by event

#### Metrics
- `GET /metrics` — Prometheus metrics
- `GET /metrics/notification` — Notification metrics
- `GET /metrics/system` — System metrics
- `GET /metrics/all` — All metrics
- `GET /metrics/summary` — Summary metrics
- `GET /metrics/notification/summary` — Notification summary metrics
- `GET /metrics/system/summary` — System summary metrics
- `POST /metrics/reset` — Reset metrics

#### Business Events
- `POST /business-events/custom` — Send custom business event
- `POST /business-events/user/registered` — User registered business event
- See the full list of business events in the [Notification Module README](./src/modules/notification/README.notification.md)

#### Health & Monitoring
- `GET /health` — General health check
- `GET /health/simple` — Simple health check
- `GET /health/ready` — Readiness probe
- `GET /health/live` — Liveness probe

---

## 7. Development

### Available Scripts

```bash
# Development
pnpm start:dev          # Start development server with hot reload
pnpm start:debug        # Start with debug mode
pnpm start:prod         # Start production server

# Testing
pnpm test               # Run unit tests
pnpm test:watch         # Run tests in watch mode
pnpm test:cov           # Run tests with coverage
pnpm test:e2e           # Run end-to-end tests
pnpm test:debug         # Run tests with debugger

# Code Quality
pnpm lint               # Run ESLint with auto-fix
pnpm format             # Format code with Prettier
pnpm type-check         # Run TypeScript type checking

# Database
pnpm db:generate        # Generate Prisma client
pnpm db:migrate         # Deploy database migrations
pnpm db:migrate:dev     # Create and apply new migration
pnpm db:migrate:reset   # Reset database and apply migrations
pnpm db:studio          # Open Prisma Studio

# Build & Clean
pnpm build              # Build the application
```

### Project Structure

```
src/
├── application/           # Application layer (use cases, DTOs, services)
│   ├── dtos/             # Data Transfer Objects
│   └── services/         # Application services
├── domain/               # Domain layer (entities, interfaces, enums)
│   ├── enums/           # Domain enums (NotificationChannel, NotificationType)
│   ├── interfaces/      # Domain interfaces
│   ├── types/           # Domain types
│   ├── abstracts/       # Abstract classes
│   ├── exceptions/      # Domain exceptions
│   └── mappers/         # Data mappers
├── infrastructure/       # Infrastructure layer
│   ├── audit/           # Audit logging
│   ├── cache/           # Caching infrastructure
│   ├── decorators/      # Custom decorators
│   ├── guards/          # Authentication guards
│   ├── interceptors/    # Request/response interceptors
│   ├── logger/          # Logging infrastructure
│   ├── metrics/         # Metrics and monitoring
│   ├── prisma/          # Database layer
│   ├── queue/           # Queue management
│   ├── messaging/       # Microservice messaging
│   ├── rate-limiting/   # Rate limiting
│   └── resilience/      # Circuit breaker and resilience
├── modules/              # Feature modules
│   ├── health/          # Health check module
│   └── notification/    # Notification module
│       ├── configs/     # Notification configurations
│       ├── dtos/        # Notification DTOs
│       ├── interfaces/  # Notification interfaces
│       ├── listeners/   # Event listeners
│       ├── notifiers/   # Notification providers (SendGrid, Twilio)
│       ├── providers/   # Module providers
│       └── services/    # Notification services
├── presentation/         # Presentation layer
├── shared/               # Shared utilities and configurations
│   ├── config/          # Configuration files
│   ├── interceptors/    # Global interceptors
│   ├── schemas/         # Environment validation schemas
│   ├── tasks/           # Scheduled tasks
│   ├── types/           # Shared types
│   └── utils/           # Utility functions
├── app.module.ts         # Root application module
└── main.ts              # Application bootstrap
```

### Architecture Patterns

#### **Event-Driven Architecture**
- **EventEmitter2**: Robust event system with typed events
- **Listener Management**: Dynamic listener registration and control
- **Event Types**: Structured events for all notification operations
- **Asynchronous Processing**: Non-blocking event handling

#### **Queue Management**
- **BullMQ**: Redis-based job queue processing
- **Priority Queues**: High-priority notification handling
- **Retry Logic**: Configurable retry policies with backoff
- **Job Scheduling**: Delayed and recurring job support

#### **Multi-Channel Notifications**
- **SendGrid**: Email delivery with templates
- **Twilio**: SMS delivery with verification codes
- **Push Notifications**: Mobile push notification support
- **In-App Notifications**: Internal application notifications

#### **Clean Architecture**
- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External dependencies and implementations
- **Presentation Layer**: Controllers and API endpoints

---

## 8. Event System

### Event Types

#### **1. notification.sent**
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

#### **2. notification.failed**
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

#### **3. notification.queued**
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

### Listener Management

The service provides comprehensive listener management:

- **Dynamic Registration**: Register listeners at runtime
- **Priority Control**: Control execution order
- **Enable/Disable**: Granular listener control
- **Metrics**: Real-time listener performance metrics
- **Retry Logic**: Automatic retries with exponential backoff

---

## 9. Troubleshooting

- **Database connection issues:** Check your `DATABASE_URL` and if PostgreSQL is running.
- **Redis issues:** Ensure Redis is running and `REDIS_HOST/PORT` are correct.
- **SendGrid issues:** Verify your `SENDGRID_API_KEY` and sender email configuration.
- **Twilio issues:** Check your `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`.
- **Queue issues:** Ensure Redis is properly configured for BullMQ.
- **JWT issues:** Use a strong `JWT_SECRET_KEY` (minimum 32 characters).
- **Listener issues:** Check listener registration and enable/disable status.

---

## 10. Deployment

```bash
# Build and start production
pnpm build
pnpm start:prod
```

Or use Docker:

```bash
docker build -t notification-service .
docker run -p 5000:5000 \
  -e DATABASE_URL="your_production_db_url" \
  -e REDIS_HOST="your_redis_host" \
  -e SENDGRID_API_KEY="your_sendgrid_key" \
  -e TWILIO_ACCOUNT_SID="your_twilio_sid" \
  -e TWILIO_AUTH_TOKEN="your_twilio_token" \
  notification-service
```

---

## 📝 Terms of Use

- **Non-commercial** project.
- All rights related to user data and privacy are respected.
- This project aims to serve as a learning and portfolio tool.

---

## Author

Kaiky Tupinambá — Fullstack Developer
