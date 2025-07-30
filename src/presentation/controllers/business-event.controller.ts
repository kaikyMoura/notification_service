import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseType } from 'src/shared/types/response-type';
import { BusinessEventEmitterService } from '../../modules/notification/services/business-event-emitter.service';

/**
 * @class BusinessEventController
 * @description Controller for emitting business events
 */
@ApiTags('Business Events')
@Controller('business-events')
export class BusinessEventController {
  constructor(private readonly businessEventEmitter: BusinessEventEmitterService) {}

  /**
   * Emit user registered event
   * @param body - Event data
   * @returns Promise<ResponseType<{ eventId: string }>>
   */
  @Post('user/registered')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Emit user registered event' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'User registered event emitted successfully',
  })
  emitUserRegistered(
    @Body()
    body: {
      userId: string;
      email: string;
      name: string;
      phone?: string;
      source: string;
      metadata?: Record<string, any>;
    },
  ): ResponseType<{ eventId: string }> {
    try {
      this.businessEventEmitter.emitUserRegistered(body);

      return {
        success: true,
        message: 'User registered event emitted successfully',
        data: { eventId: `user.registered.${Date.now()}` },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to emit user registered event');
    }
  }

  /**
   * Emit user verified event
   * @param body - Event data
   * @returns Promise<ResponseType<{ eventId: string }>>
   */
  @Post('user/verified')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Emit user verified event' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'User verified event emitted successfully',
  })
  emitUserVerified(
    @Body()
    body: {
      userId: string;
      verificationType: 'email' | 'phone';
      verifiedAt: Date;
      metadata?: Record<string, any>;
    },
  ): ResponseType<{ eventId: string }> {
    try {
      this.businessEventEmitter.emitUserVerified(body);

      return {
        success: true,
        message: 'User verified event emitted successfully',
        data: { eventId: `user.verified.${Date.now()}` },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to emit user verified event');
    }
  }

  /**
   * Emit order placed event
   * @param body - Event data
   * @returns Promise<ResponseType<{ eventId: string }>>
   */
  @Post('order/placed')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Emit order placed event' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Order placed event emitted successfully',
  })
  emitOrderPlaced(
    @Body()
    body: {
      userId: string;
      orderId: string;
      amount: number;
      currency: string;
      items: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
      }>;
      shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
      metadata?: Record<string, any>;
    },
  ): ResponseType<{ eventId: string }> {
    try {
      this.businessEventEmitter.emitOrderPlaced(body);

      return {
        success: true,
        message: 'Order placed event emitted successfully',
        data: { eventId: `order.placed.${Date.now()}` },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to emit order placed event');
    }
  }

  /**
   * Emit order shipped event
   * @param body - Event data
   * @returns Promise<ResponseType<{ eventId: string }>>
   */
  @Post('order/shipped')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Emit order shipped event' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Order shipped event emitted successfully',
  })
  emitOrderShipped(
    @Body()
    body: {
      userId: string;
      orderId: string;
      trackingNumber: string;
      carrier: string;
      estimatedDelivery: Date;
      metadata?: Record<string, any>;
    },
  ): ResponseType<{ eventId: string }> {
    try {
      this.businessEventEmitter.emitOrderShipped(body);

      return {
        success: true,
        message: 'Order shipped event emitted successfully',
        data: { eventId: `order.shipped.${Date.now()}` },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to emit order shipped event');
    }
  }

  /**
   * Emit order delivered event
   * @param body - Event data
   * @returns Promise<ResponseType<{ eventId: string }>>
   */
  @Post('order/delivered')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Emit order delivered event' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Order delivered event emitted successfully',
  })
  emitOrderDelivered(
    @Body()
    body: {
      userId: string;
      orderId: string;
      deliveredAt: Date;
      signature?: string;
      metadata?: Record<string, any>;
    },
  ): ResponseType<{ eventId: string }> {
    try {
      this.businessEventEmitter.emitOrderDelivered(body);

      return {
        success: true,
        message: 'Order delivered event emitted successfully',
        data: { eventId: `order.delivered.${Date.now()}` },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to emit order delivered event');
    }
  }

  /**
   * Emit payment processed event
   * @param body - Event data
   * @returns Promise<ResponseType<{ eventId: string }>>
   */
  @Post('payment/processed')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Emit payment processed event' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Payment processed event emitted successfully',
  })
  emitPaymentProcessed(
    @Body()
    body: {
      userId: string;
      orderId: string;
      amount: number;
      currency: string;
      paymentMethod: string;
      status: 'success' | 'failed' | 'pending';
      transactionId: string;
      metadata?: Record<string, any>;
    },
  ): ResponseType<{ eventId: string }> {
    try {
      this.businessEventEmitter.emitPaymentProcessed(body);

      return {
        success: true,
        message: 'Payment processed event emitted successfully',
        data: { eventId: `payment.processed.${Date.now()}` },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to emit payment processed event');
    }
  }

  /**
   * Emit password reset requested event
   * @param body - Event data
   * @returns Promise<ResponseType<{ eventId: string }>>
   */
  @Post('password/reset-requested')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Emit password reset requested event' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Password reset requested event emitted successfully',
  })
  emitPasswordResetRequested(
    @Body()
    body: {
      userId: string;
      email: string;
      resetToken: string;
      expiresAt: Date;
      metadata?: Record<string, any>;
    },
  ): ResponseType<{ eventId: string }> {
    try {
      this.businessEventEmitter.emitPasswordResetRequested(body);

      return {
        success: true,
        message: 'Password reset requested event emitted successfully',
        data: { eventId: `password.reset.requested.${Date.now()}` },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to emit password reset requested event');
    }
  }

  /**
   * Emit account locked event
   * @param body - Event data
   * @returns Promise<ResponseType<{ eventId: string }>>
   */
  @Post('account/locked')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Emit account locked event' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Account locked event emitted successfully',
  })
  emitAccountLocked(
    @Body() body: { userId: string; reason: string; lockedAt: Date; unlockAt?: Date; metadata?: Record<string, any> },
  ): ResponseType<{ eventId: string }> {
    try {
      this.businessEventEmitter.emitAccountLocked(body);

      return {
        success: true,
        message: 'Account locked event emitted successfully',
        data: { eventId: `account.locked.${Date.now()}` },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to emit account locked event');
    }
  }

  /**
   * Emit login attempt event
   * @param body - Event data
   * @returns Promise<ResponseType<{ eventId: string }>>
   */
  @Post('login/attempt')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Emit login attempt event' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Login attempt event emitted successfully',
  })
  emitLoginAttempt(
    @Body()
    body: {
      userId: string;
      email: string;
      success: boolean;
      ipAddress: string;
      userAgent: string;
      location?: {
        country: string;
        city: string;
      };
      metadata?: Record<string, any>;
    },
  ): ResponseType<{ eventId: string }> {
    try {
      this.businessEventEmitter.emitLoginAttempt(body);

      return {
        success: true,
        message: 'Login attempt event emitted successfully',
        data: { eventId: `login.attempt.${Date.now()}` },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to emit login attempt event');
    }
  }

  /**
   * Emit subscription created event
   * @param body - Event data
   * @returns Promise<ResponseType<{ eventId: string }>>
   */
  @Post('subscription/created')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Emit subscription created event' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Subscription created event emitted successfully',
  })
  emitSubscriptionCreated(
    @Body()
    body: {
      userId: string;
      subscriptionId: string;
      planId: string;
      planName: string;
      amount: number;
      currency: string;
      interval: 'monthly' | 'yearly';
      startDate: Date;
      endDate: Date;
      metadata?: Record<string, any>;
    },
  ): ResponseType<{ eventId: string }> {
    try {
      this.businessEventEmitter.emitSubscriptionCreated(body);

      return {
        success: true,
        message: 'Subscription created event emitted successfully',
        data: { eventId: `subscription.created.${Date.now()}` },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to emit subscription created event');
    }
  }

  /**
   * Emit custom business event
   * @param body - Event data
   * @returns Promise<ResponseType<{ eventId: string }>>
   */
  @Post('custom')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Emit custom business event' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Custom business event emitted successfully',
  })
  emitCustomEvent(
    @Body() body: { eventType: string; userId: string; [key: string]: any },
  ): ResponseType<{ eventId: string }> {
    try {
      const { eventType, ...eventData } = body;
      this.businessEventEmitter.emitCustomEvent(eventType as any, eventData);

      return {
        success: true,
        message: 'Custom business event emitted successfully',
        data: { eventId: `${eventType}.${Date.now()}` },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to emit custom business event');
    }
  }
}
