import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateNotificationDto } from 'src/application/dtos/create-notification.dto';
import { WelcomeEmailUseCase } from 'src/application/use-cases/welcome-email.use-case';
import { NotificationChannelEnum } from 'src/domain/enums/notification-chanel.enum';
import { NotificationTypeEnum } from 'src/domain/enums/notification-type.enum';
import { NotificationValidationException } from 'src/domain/exceptions/notification.exceptions';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { SendgridNotifier } from '../../notifiers/sendigrid.notifier';
import { TwilioNotifier } from '../../notifiers/twilio.notifier';
import { NotificationEventEmitterService } from '../notification-event-emitter.service';
import { NotificationService } from '../notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let sendgridNotifier: jest.Mocked<SendgridNotifier>;
  let twilioNotifier: jest.Mocked<TwilioNotifier>;
  let welcomeEmailUseCase: jest.Mocked<WelcomeEmailUseCase>;
  let eventEmitter: jest.Mocked<NotificationEventEmitterService>;
  let logger: jest.Mocked<ILoggerService>;

  const mockCreateNotificationDto: CreateNotificationDto = {
    userId: 'user123',
    channel: NotificationChannelEnum.EMAIL,
    type: NotificationTypeEnum.INFO,
    title: 'Test Notification',
    message: 'This is a test notification',
    email: 'test@example.com',
    phone: '+1234567890',
  };

  beforeEach(async () => {
    const mockSendgridNotifier = {
      send: jest.fn(),
    };

    const mockTwilioNotifier = {
      send: jest.fn(),
    };

    const mockWelcomeEmailUseCase = {
      execute: jest.fn(),
    };

    const mockEventEmitter = {
      emitNotificationQueued: jest.fn(),
      emitNotificationSent: jest.fn(),
      emitNotificationFailed: jest.fn(),
      emitWelcomeEmailSent: jest.fn(),
      emitVerificationCodeSent: jest.fn(),
      emitVerificationCodeVerified: jest.fn(),
    };

    const mockLogger = {
      debug: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: SendgridNotifier,
          useValue: mockSendgridNotifier,
        },
        {
          provide: TwilioNotifier,
          useValue: mockTwilioNotifier,
        },
        {
          provide: WelcomeEmailUseCase,
          useValue: mockWelcomeEmailUseCase,
        },
        {
          provide: NotificationEventEmitterService,
          useValue: mockEventEmitter,
        },
        {
          provide: 'LOGGER_SERVICE',
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    sendgridNotifier = module.get(SendgridNotifier);
    twilioNotifier = module.get(TwilioNotifier);
    welcomeEmailUseCase = module.get(WelcomeEmailUseCase);
    eventEmitter = module.get(NotificationEventEmitterService);
    logger = module.get('LOGGER_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('should send email notification successfully', async () => {
      // Arrange
      const emailDto = { ...mockCreateNotificationDto, channel: NotificationChannelEnum.EMAIL };
      sendgridNotifier.send.mockResolvedValue(undefined);

      // Act
      await service.send(emailDto);

      // Assert
      expect(sendgridNotifier.send).toHaveBeenCalledWith(emailDto);
      expect(eventEmitter.emitNotificationQueued).toHaveBeenCalled();
      expect(eventEmitter.emitNotificationSent).toHaveBeenCalledWith(emailDto);
      expect(eventEmitter.emitNotificationFailed).not.toHaveBeenCalledWith(emailDto);
    });

    it('should send SMS notification successfully', async () => {
      // Arrange
      const smsDto = { ...mockCreateNotificationDto, channel: NotificationChannelEnum.SMS };
      twilioNotifier.send.mockResolvedValue(undefined);

      // Act
      await service.send(smsDto);

      // Assert
      expect(twilioNotifier.send).toHaveBeenCalledWith(smsDto);
      expect(eventEmitter.emitNotificationQueued).toHaveBeenCalled();
      expect(eventEmitter.emitNotificationSent).toHaveBeenCalled();
    });

    it('should throw NotificationValidationException for missing userId', async () => {
      // Arrange
      const invalidDto = { ...mockCreateNotificationDto, userId: '' };

      // Act & Assert
      await expect(service.send(invalidDto)).rejects.toThrow(NotificationValidationException);
      expect(eventEmitter.emitNotificationFailed).toHaveBeenCalled();
    });

    it('should throw NotificationValidationException for missing channel', async () => {
      // Arrange
      const invalidDto = { ...mockCreateNotificationDto, channel: undefined as any };

      // Act & Assert
      await expect(service.send(invalidDto)).rejects.toThrow(NotificationValidationException);
    });

    it('should throw NotificationValidationException for missing email in EMAIL channel', async () => {
      // Arrange
      const invalidDto = { ...mockCreateNotificationDto, channel: NotificationChannelEnum.EMAIL, email: '' };

      // Act & Assert
      await expect(service.send(invalidDto)).rejects.toThrow(NotificationValidationException);
    });

    it('should throw NotificationValidationException for missing phone in SMS channel', async () => {
      // Arrange
      const invalidDto = { ...mockCreateNotificationDto, channel: NotificationChannelEnum.SMS, phone: '' };

      // Act & Assert
      await expect(service.send(invalidDto)).rejects.toThrow(NotificationValidationException);
    });

    it('should throw NotificationValidationException for invalid email format', async () => {
      // Arrange
      const invalidDto = { ...mockCreateNotificationDto, email: 'invalid-email' };

      // Act & Assert
      await expect(service.send(invalidDto)).rejects.toThrow(NotificationValidationException);
    });

    it('should throw NotificationValidationException for invalid phone format', async () => {
      // Arrange
      const invalidDto = { ...mockCreateNotificationDto, channel: NotificationChannelEnum.SMS, phone: 'invalid-phone' };

      // Act & Assert
      await expect(service.send(invalidDto)).rejects.toThrow(NotificationValidationException);
    });

    it('should throw NotificationValidationException for title too long', async () => {
      // Arrange
      const invalidDto = { ...mockCreateNotificationDto, title: 'a'.repeat(201) };

      // Act & Assert
      await expect(service.send(invalidDto)).rejects.toThrow(NotificationValidationException);
    });

    it('should throw NotificationValidationException for message too long', async () => {
      // Arrange
      const invalidDto = { ...mockCreateNotificationDto, message: 'a'.repeat(1001) };

      // Act & Assert
      await expect(service.send(invalidDto)).rejects.toThrow(NotificationValidationException);
    });

    it('should handle provider errors and emit failed event', async () => {
      // Arrange
      const error = new Error('Provider error');
      sendgridNotifier.send.mockRejectedValue(error);

      // Act & Assert
      await expect(() => service.send(mockCreateNotificationDto)).rejects.toThrow();
      expect(eventEmitter.emitNotificationFailed).toHaveBeenCalled();
    });

    it('should throw BadRequestException for unsupported channel', async () => {
      // Arrange
      const invalidDto = { ...mockCreateNotificationDto, channel: 'UNSUPPORTED' as any };

      // Act & Assert
      await expect(service.send(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      // Arrange
      welcomeEmailUseCase.execute.mockResolvedValue(undefined);

      // Act
      await service.sendWelcomeEmail(mockCreateNotificationDto);

      // Assert
      expect(welcomeEmailUseCase.execute).toHaveBeenCalledWith(mockCreateNotificationDto);
      expect(eventEmitter.emitWelcomeEmailSent).toHaveBeenCalled();
    });

    it('should handle welcome email errors', async () => {
      // Arrange
      const error = new Error('Welcome email error');
      welcomeEmailUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(service.sendWelcomeEmail(mockCreateNotificationDto)).rejects.toThrow();
    });
  });

  describe('sendVerificationCode', () => {
    it('should send verification code successfully', async () => {
      // Arrange
      const phoneNumber = '+1234567890';
      twilioNotifier.send.mockResolvedValue(undefined);

      // Act
      const result = await service.sendVerificationCode(phoneNumber);

      // Assert
      expect(result.status).toBe('success');
      expect(result.message).toContain('Verification code sent');
      expect(eventEmitter.emitVerificationCodeSent).toHaveBeenCalled();
    });

    it('should handle verification code errors', async () => {
      // Arrange
      const phoneNumber = '+1234567890';
      const error = new Error('Verification code error');
      twilioNotifier.send.mockRejectedValue(error);

      // Act
      const result = await service.sendVerificationCode(phoneNumber);

      // Assert
      expect(result.status).toBe('error');
      expect(result.message).toContain('Failed to send verification code');
    });
  });

  describe('checkVerificationCode', () => {
    it('should check verification code successfully', async () => {
      // Arrange
      const code = '123456';
      const phoneNumber = '+1234567890';

      // Act
      const result = await service.checkVerificationCode(code, phoneNumber);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Verification code verified');
      expect(eventEmitter.emitVerificationCodeVerified).toHaveBeenCalled();
    });

    it('should handle invalid verification code', async () => {
      // Arrange
      const code = 'invalid';
      const phoneNumber = '+1234567890';

      // Act
      const result = await service.checkVerificationCode(code, phoneNumber);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid verification code');
    });
  });

  describe('validation', () => {
    it('should validate email format correctly', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'user+tag@example.org'];
      const invalidEmails = ['invalid-email', '@example.com', 'test@', 'test.example.com'];

      validEmails.forEach(email => {
        const dto = { ...mockCreateNotificationDto, email };
        expect(() => service['validateNotificationData'](dto)).not.toThrow();
      });

      invalidEmails.forEach(email => {
        const dto = { ...mockCreateNotificationDto, email };
        expect(() => service['validateNotificationData'](dto)).toThrow(NotificationValidationException);
      });
    });

    it('should validate phone format correctly', () => {
      const validPhones = ['+1234567890', '1234567890', '+5511999999999'];
      const invalidPhones = ['invalid-phone', '123', 'abc123', '+'];

      validPhones.forEach(phone => {
        const dto = { ...mockCreateNotificationDto, channel: NotificationChannelEnum.SMS, phone };
        expect(() => service['validateNotificationData'](dto)).not.toThrow();
      });

      invalidPhones.forEach(phone => {
        const dto = { ...mockCreateNotificationDto, channel: NotificationChannelEnum.SMS, phone };
        expect(() => service['validateNotificationData'](dto)).toThrow(NotificationValidationException);
      });
    });
  });

  describe('utility methods', () => {
    it('should generate unique notification ID', () => {
      const id1 = service['generateNotificationId']();
      const id2 = service['generateNotificationId']();

      expect(id1).toMatch(/^notif_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^notif_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should return correct provider name for channels', () => {
      expect(service['getProviderName'](NotificationChannelEnum.EMAIL)).toBe('SendGrid');
      expect(service['getProviderName'](NotificationChannelEnum.SMS)).toBe('Twilio');
      expect(service['getProviderName']('UNKNOWN' as any)).toBe('Unknown');
    });
  });
}); 