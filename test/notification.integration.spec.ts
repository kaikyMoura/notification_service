import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { NotificationModule } from '../src/modules/notification/notification.module';
import { NotificationChannelEnum } from '../src/domain/enums/notification-chanel.enum';
import { NotificationTypeEnum } from '../src/domain/enums/notification-type.enum';

describe('Notification Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotificationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /notifications', () => {
    it('should send email notification successfully', async () => {
      const notificationData = {
        userId: 'user123',
        channel: NotificationChannelEnum.EMAIL,
        type: NotificationTypeEnum.INFO,
        title: 'Test Email',
        message: 'This is a test email notification',
        email: 'test@example.com',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .send(notificationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Notification sent successfully');
    });

    it('should send SMS notification successfully', async () => {
      const notificationData = {
        userId: 'user456',
        channel: NotificationChannelEnum.SMS,
        type: NotificationTypeEnum.ALERT,
        title: 'Test SMS',
        message: 'This is a test SMS notification',
        phone: '+1234567890',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .send(notificationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Notification sent successfully');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        userId: 'user123',
        channel: NotificationChannelEnum.EMAIL,
        // Missing email
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email is required');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidData = {
        userId: 'user123',
        channel: NotificationChannelEnum.EMAIL,
        type: NotificationTypeEnum.INFO,
        title: 'Test',
        message: 'Test message',
        email: 'invalid-email',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email format');
    });

    it('should return 400 for invalid phone format', async () => {
      const invalidData = {
        userId: 'user123',
        channel: NotificationChannelEnum.SMS,
        type: NotificationTypeEnum.INFO,
        title: 'Test',
        message: 'Test message',
        phone: 'invalid-phone',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid phone number format');
    });
  });

  describe('POST /notifications/welcome-email', () => {
    it('should send welcome email successfully', async () => {
      const welcomeEmailData = {
        userId: 'newuser123',
        email: 'newuser@example.com',
        title: 'Welcome!',
        message: 'Welcome to our platform!',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/welcome-email')
        .send(welcomeEmailData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Welcome email sent successfully');
    });
  });

  describe('POST /notifications/verification-code', () => {
    it('should send verification code successfully', async () => {
      const verificationData = {
        phoneNumber: '+1234567890',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/verification-code')
        .send(verificationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Verification code sent');
    });
  });

  describe('POST /notifications/verify-code', () => {
    it('should verify code successfully', async () => {
      const verificationData = {
        code: '123456',
        phoneNumber: '+1234567890',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/verify-code')
        .send(verificationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Verification code verified');
    });

    it('should return 400 for invalid code', async () => {
      const invalidData = {
        code: 'invalid',
        phoneNumber: '+1234567890',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/verify-code')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid verification code');
    });
  });

  describe('POST /business-events/user/registered', () => {
    it('should emit user registered event successfully', async () => {
      const eventData = {
        userId: 'newuser789',
        email: 'newuser@example.com',
        name: 'John Doe',
        source: 'web',
      };

      const response = await request(app.getHttpServer())
        .post('/business-events/user/registered')
        .send(eventData)
        .expect(202);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('User registered event emitted successfully');
    });
  });

  describe('POST /business-events/order/placed', () => {
    it('should emit order placed event successfully', async () => {
      const eventData = {
        userId: 'user123',
        orderId: 'order456',
        amount: 99.99,
        currency: 'USD',
        items: [
          {
            id: 'item1',
            name: 'Product 1',
            quantity: 2,
            price: 49.99,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/business-events/order/placed')
        .send(eventData)
        .expect(202);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Order placed event emitted successfully');
    });
  });

  describe('GET /notification-listeners', () => {
    it('should return list of listeners', async () => {
      const response = await request(app.getHttpServer())
        .get('/notification-listeners')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /notification-listeners/metrics', () => {
    it('should return listener metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/notification-listeners/metrics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalSent');
      expect(response.body.data).toHaveProperty('totalFailed');
      expect(response.body.data).toHaveProperty('successRate');
    });
  });

  describe('POST /notification-listeners/enable', () => {
    it('should enable listener successfully', async () => {
      const enableData = {
        name: 'NotificationLoggerListener',
      };

      const response = await request(app.getHttpServer())
        .post('/notification-listeners/enable')
        .send(enableData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.enabled).toBe(true);
    });
  });

  describe('POST /notification-listeners/disable', () => {
    it('should disable listener successfully', async () => {
      const disableData = {
        name: 'NotificationLoggerListener',
      };

      const response = await request(app.getHttpServer())
        .post('/notification-listeners/disable')
        .send(disableData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.disabled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle provider errors gracefully', async () => {
      // This test would require mocking provider failures
      const notificationData = {
        userId: 'user123',
        channel: NotificationChannelEnum.EMAIL,
        type: NotificationTypeEnum.INFO,
        title: 'Test',
        message: 'Test message',
        email: 'test@example.com',
      };

      // Mock provider failure scenario
      const response = await request(app.getHttpServer())
        .post('/notifications')
        .send(notificationData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Failed to send notification');
    });

    it('should handle rate limiting', async () => {
      const notificationData = {
        userId: 'user123',
        channel: NotificationChannelEnum.EMAIL,
        type: NotificationTypeEnum.INFO,
        title: 'Test',
        message: 'Test message',
        email: 'test@example.com',
      };

      // Send multiple requests quickly to trigger rate limiting
      const promises = Array(10).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/notifications')
          .send(notificationData)
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);

      expect(rateLimited).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const notificationData = {
        userId: 'user123',
        channel: NotificationChannelEnum.EMAIL,
        type: NotificationTypeEnum.INFO,
        title: 'Test',
        message: 'Test message',
        email: 'test@example.com',
      };

      const startTime = Date.now();
      const promises = Array(50).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/notifications')
          .send(notificationData)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const successfulResponses = responses.filter(r => r.status === 201);
      const successRate = (successfulResponses.length / responses.length) * 100;

      expect(successRate).toBeGreaterThan(80); // At least 80% success rate
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should maintain performance under load', async () => {
      const notificationData = {
        userId: 'user123',
        channel: NotificationChannelEnum.EMAIL,
        type: NotificationTypeEnum.INFO,
        title: 'Test',
        message: 'Test message',
        email: 'test@example.com',
      };

      const responseTimes: number[] = [];

      for (let i = 0; i < 20; i++) {
        const startTime = Date.now();
        await request(app.getHttpServer())
          .post('/notifications')
          .send(notificationData)
          .expect(201);
        const endTime = Date.now();
        responseTimes.push(endTime - startTime);
      }

      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);

      expect(averageResponseTime).toBeLessThan(2000); // Average under 2 seconds
      expect(maxResponseTime).toBeLessThan(5000); // Max under 5 seconds
    });
  });
}); 