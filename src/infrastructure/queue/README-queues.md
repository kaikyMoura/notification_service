# Queue System - Notification Service

This document explains how to use the queue system implemented in the Notification service.

## Architecture

The system uses **BullMQ** with **Redis** for asynchronous notification processing:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client        │───▶│  Notification API   │───▶│  Redis Queue    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Workers         │
                       │  (Processors)    │
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Notifications   │
                       │  (WebSocket/Email)│
                       └──────────────────┘
```

## Available Queues

### 1. Notification Queue
- **Name**: `notifications`
- **Purpose**: Process notifications
- **Concurrency**: 5 jobs simultaneously
- **Attempts**: 3 with exponential backoff

### 2. Notifications Queue
- **Name**: `notifications`
- **Purpose**: Send notifications to users
- **Concurrency**: 10 jobs simultaneously
- **Attempts**: 2

## API Endpoints

### Asynchronous Processing
```bash
POST /notification/process-notification/async
Content-Type: multipart/form-data

{
  "userId": "user-123",
  "type": "notification",
  "data": "Hello, world!"
}
```

**Resposta:**
```json
{
  "jobId": "notification-123",
  "status": "queued",
  "message": "Notification queued for processing"
}
```

### Check Job Status
```bash
GET /notification/job/{jobId}/status
```

**Resposta:**
```json
{
  "id": "notification-123",
  "status": "completed",
  "progress": 100,
  "result": {
    "message": "Hello, world!"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "processedOn": "2024-01-01T00:00:05.000Z",
  "finishedOn": "2024-01-01T00:00:10.000Z"
}
```

### Cancel Job
```bash
DELETE /notification/job/{jobId}
```

### Queue Statistics
```bash
GET /notification/queue/stats
```

**Resposta:**
```json
{
  "notifications": {
    "waiting": 5,
    "active": 2,
    "completed": 100,
    "failed": 3,
    "delayed": 0,
    "paused": 0
  },
  "notifications": {
    "waiting": 10,
    "active": 3,
    "completed": 50,
    "failed": 1
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Processing Flow

### 1. Upload Document
```typescript
// Client sends document
const response = await fetch('/notification/process-notification/async', {
  method: 'POST',
  body: formData
});

const { jobId, documentId } = await response.json();
```

### 2. Monitoring Progress
```typescript
// Client monitors progress
const checkStatus = async (jobId: string) => {
  const response = await fetch(`/notification/job/${jobId}/status`);
  const status = await response.json();
  
  switch (status.status) {
    case 'completed':
      console.log('Processing completed:', status.result);
      break;
    case 'failed':
      console.error('Processing error:', status.failedReason);
      break;
    case 'active':
      console.log(`Progress: ${status.progress}%`);
      setTimeout(() => checkStatus(jobId), 2000);
      break;
  }
};
```

### 3. Notifications
The system automatically sends notifications when:
- ✅ Document processed successfully
- ❌ Processing error
- ⚠️ Quota exceeded

## Environment Configuration

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Queues
NOTIFICATIONS_CONCURRENCY=5
NOTIFICATIONS_ATTEMPTS=3
NOTIFICATIONS_BACKOFF_DELAY=2000

# Cleanup
CLEANUP_COMPLETED_JOBS=100
CLEANUP_FAILED_JOBS=50
```

## Monitoring

### Bull Board (Interface Web)
Access `http://localhost:5000/admin/queues` to see:
- Jobs in queue
- Active jobs
- Completed/failed jobs
- Real-time statistics

### Logs
```bash
# View processing logs
docker logs notification-service | grep "NotificationProcessor"
```

## Error Handling

### Automatic Retry
- Failed jobs are automatically retried
- Exponential backoff: 2s, 4s, 8s
- Maximum 3 attempts for processing

### Dead Letter Queue
- Jobs that fail after all attempts go to DLQ
- Can be reprocessed manually

### Error Notifications
- Users are automatically notified about failures
- Detailed logs for debugging

## Performance

### Optimizations
- **Configurable concurrency** by queue
- **Automatic cleanup** of old jobs
- **Prioritization** of important jobs
- **Cache** of intermediate results

### Metrics
- Average processing time
- Success/failure rate
- Queue size
- Resource usage

## Complete Example

```typescript
// 1. Upload and processing
const uploadDocument = async (file: File, userId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  
  const response = await fetch('/notification/process-notification/async', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};

// 2. Monitoring
const monitorProcessing = async (jobId: string) => {
  const pollInterval = setInterval(async () => {
    const status = await fetch(`/notification/job/${jobId}/status`);
    const data = await status.json();
    
    if (data.status === 'completed') {
      clearInterval(pollInterval);
      handleSuccess(data.result);
    } else if (data.status === 'failed') {
      clearInterval(pollInterval);
      handleError(data.failedReason);
    }
  }, 2000);
};

// 3. Usage
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  const { jobId } = await uploadDocument(file, 'user-123');
  monitorProcessing(jobId);
};
```

## Next Steps

1. **Implement WebSockets** for real-time notifications
2. **Add metrics** with Prometheus
3. **Implement rate limiting** by user