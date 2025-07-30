import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateNotificationDto } from 'src/application/dtos/create-notification.dto';
import { NotificationChannelEnum } from 'src/domain/enums/notification-chanel.enum';
import { NotificationTypeEnum } from 'src/domain/enums/notification-type.enum';
import { NotificationValidationException } from 'src/domain/exceptions/notification.exceptions';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { SendgridNotifier } from '../../notifiers/sendigrid.notifier';
import { TwilioNotifier } from '../../notifiers/twilio.notifier';
import { NotificationEventEmitterService } from '../notification-event-emitter.service';
import { NotificationService } from '../notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let sendgridNotifier: jest.Mocked<SendgridNotifier>;
  let twilioNotifier: jest.Mocked<TwilioNotifier>;
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
      sendVerificationCode: jest.fn(),
      checkVerificationCode: jest.fn(),
    };

    const mockEventEmitter = {
      emitNotificationQueued: jest.fn(),
      emitNotificationSent: jest.fn(),
      emitNotificationFailed: jest.fn(),
      emitVerificationCodeSent: jest.fn(),
      emitVerificationCodeVerified: jest.fn(),
      emitWelcomeEmailSent: jest.fn(),
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
          provide: NotificationEventEmitterService,
          useValue: mockEventEmitter,
        },
        {
          provide: LOGGER_SERVICE,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    sendgridNotifier = module.get(SendgridNotifier);
    twilioNotifier = module.get(TwilioNotifier);
    eventEmitter = module.get(NotificationEventEmitterService);
    logger = module.get(LOGGER_SERVICE);
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
      expect(eventEmitter.emitNotificationSent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: emailDto.userId,
          channel: emailDto.channel,
          type: emailDto.type,
          email: emailDto.email,
          title: emailDto.title,
          message: emailDto.message,
        }),
      );
      expect(eventEmitter.emitNotificationFailed).not.toHaveBeenCalled();
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
      expect(eventEmitter.emitNotificationSent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: smsDto.userId,
          channel: smsDto.channel,
          type: smsDto.type,
          phone: smsDto.phone,
          title: smsDto.title,
          message: smsDto.message,
        }),
      );
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
      const emailDto = { ...mockCreateNotificationDto, channel: NotificationChannelEnum.EMAIL };
      sendgridNotifier.send.mockResolvedValue(undefined);

      // Act
      await service.sendWelcomeEmail(emailDto);

      // Assert
      expect(sendgridNotifier.send).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: emailDto.userId,
          email: emailDto.email,
          title: 'Welcome to our platform',
          type: NotificationTypeEnum.SUCCESS,
          channel: NotificationChannelEnum.EMAIL,
          message: expect.stringContaining('Welcome'),
        }),
      );
      expect(eventEmitter.emitNotificationQueued).toHaveBeenCalled();
      expect(eventEmitter.emitWelcomeEmailSent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: emailDto.userId,
          email: emailDto.email,
        }),
      );
      expect(eventEmitter.emitNotificationFailed).not.toHaveBeenCalled();
    });
  });

  describe('sendVerificationCode', () => {
    it('should send verification code successfully', async () => {
      // Arrange
      const phoneNumber = '+1234567890';
      const mockResult = { status: 'pending', message: 'OTP sent successfully to +1234567890' };
      twilioNotifier.sendVerificationCode.mockResolvedValue(mockResult);

      // Act
      const result = await service.sendVerificationCode(phoneNumber);

      // Assert
      expect(result).toEqual(mockResult);
      expect(twilioNotifier.sendVerificationCode).toHaveBeenCalledWith(phoneNumber);
      expect(eventEmitter.emitVerificationCodeSent).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneNumber,
          provider: 'Twilio',
        }),
      );
    });

    it('should handle verification code errors', async () => {
      // Arrange
      const phoneNumber = '+1234567890';
      const error = new Error('Verification code error');
      twilioNotifier.sendVerificationCode.mockRejectedValue(error);

      // Act & Assert
      await expect(service.sendVerificationCode(phoneNumber)).rejects.toThrow();
      expect(eventEmitter.emitNotificationFailed).toHaveBeenCalled();
    });
  });

  describe('checkVerificationCode', () => {
    it('should check verification code successfully', async () => {
      // Arrange
      const code = '123456';
      const phoneNumber = '+1234567890';
      const mockResult = { success: true, message: 'The code is valid' };
      twilioNotifier.checkVerificationCode.mockResolvedValue(mockResult);

      // Act
      const result = await service.checkVerificationCode(code, phoneNumber);

      // Assert
      expect(result).toEqual(mockResult);
      expect(twilioNotifier.checkVerificationCode).toHaveBeenCalledWith(code, phoneNumber);
      expect(eventEmitter.emitVerificationCodeVerified).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneNumber,
        }),
      );
    });

    it('should handle invalid verification code', async () => {
      // Arrange
      const code = 'invalid';
      const phoneNumber = '+1234567890';
      const mockResult = { success: false, message: 'Invalid or expired code' };
      twilioNotifier.checkVerificationCode.mockResolvedValue(mockResult);

      // Act
      const result = await service.checkVerificationCode(code, phoneNumber);

      // Assert
      expect(result).toEqual(mockResult);
      expect(twilioNotifier.checkVerificationCode).toHaveBeenCalledWith(code, phoneNumber);
      expect(eventEmitter.emitVerificationCodeVerified).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should validate email format correctly', async () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'user+tag@example.org'];
      const invalidEmails = ['invalid-email', '@example.com', 'test@', 'test.example.com'];

      // Test valid emails
      for (const email of validEmails) {
        const dto = { ...mockCreateNotificationDto, email };
        sendgridNotifier.send.mockResolvedValue(undefined);
        await expect(service.send(dto)).resolves.not.toThrow();
      }

      // Test invalid emails
      for (const email of invalidEmails) {
        const dto = { ...mockCreateNotificationDto, email };
        await expect(service.send(dto)).rejects.toThrow(NotificationValidationException);
      }
    });

    it('should validate phone format correctly', async () => {
      const validPhones = ['+1234567890', '1234567890', '+5511999999999'];
      const invalidPhones = ['invalid-phone', '123', 'abc123', '+'];

      // Test valid phones
      for (const phone of validPhones) {
        const dto = { ...mockCreateNotificationDto, channel: NotificationChannelEnum.SMS, phone };
        twilioNotifier.send.mockResolvedValue(undefined);
        await expect(service.send(dto)).resolves.not.toThrow();
      }

      // Test invalid phones - these should throw validation errors
      for (const phone of invalidPhones) {
        const dto = { ...mockCreateNotificationDto, channel: NotificationChannelEnum.SMS, phone };
        await expect(service.send(dto)).rejects.toThrow(NotificationValidationException);
      }
    });

    it('should validate phone format specifically for SMS channel', async () => {
      // Test that invalid phone numbers are rejected for SMS channel
      const invalidPhone = 'invalid-phone';
      const dto = {
        ...mockCreateNotificationDto,
        channel: NotificationChannelEnum.SMS,
        phone: invalidPhone,
      };

      await expect(service.send(dto)).rejects.toThrow(NotificationValidationException);
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
