import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationListener } from 'src/domain/interfaces/notification-listener.interface';
import { ResponseType } from 'src/shared/types/response-type';
import { NotificationMetricsListener } from '../../modules/notification/listeners/notification-metrics.listener';
import { NotificationListenerManagerService } from '../../modules/notification/services/notification-listener-manager.service';

/**
 * @class NotificationListenerController
 * @description Controller for managing notification listeners
 */
@ApiTags('Notification Listeners')
@Controller('notification-listeners')
export class NotificationListenerController {
  constructor(
    private readonly listenerManager: NotificationListenerManagerService,
    private readonly metricsListener: NotificationMetricsListener,
  ) {}

  /**
   * Get all registered listeners
   * @returns Promise<ResponseType<Array<{ name: string; eventTypes: string[]; enabled: boolean; priority: number }>>>
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all registered listeners' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listeners retrieved successfully',
  })
  getListeners(): ResponseType<Array<{ name: string; eventTypes: string[]; enabled: boolean; priority: number }>> {
    try {
      const listeners = this.listenerManager.getListenerStatus();

      return {
        success: true,
        message: 'Listeners retrieved successfully',
        data: listeners,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get listeners');
    }
  }

  /**
   * Enable a listener
   * @param body - The listener name
   * @returns Promise<ResponseType<{ enabled: boolean }>>
   */
  @Post('enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable a listener' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listener enabled successfully',
  })
  enableListener(@Body() body: { name: string }): ResponseType<{ enabled: boolean }> {
    try {
      const enabled = this.listenerManager.enableListener(body.name);

      if (!enabled) {
        throw new Error(`Listener ${body.name} not found`);
      }

      return {
        success: true,
        message: `Listener ${body.name} enabled successfully`,
        data: { enabled: true },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to enable listener');
    }
  }

  /**
   * Disable a listener
   * @param body - The listener name
   * @returns Promise<ResponseType<{ disabled: boolean }>>
   */
  @Post('disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable a listener' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listener disabled successfully',
  })
  disableListener(@Body() body: { name: string }): ResponseType<{ disabled: boolean }> {
    try {
      const disabled = this.listenerManager.disableListener(body.name);

      if (!disabled) {
        throw new Error(`Listener ${body.name} not found`);
      }

      return {
        success: true,
        message: `Listener ${body.name} disabled successfully`,
        data: { disabled: true },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to disable listener');
    }
  }

  /**
   * Get listeners for a specific event type
   * @param eventType - The event type
   * @returns Promise<ResponseType<NotificationListener[]>>
   */
  @Get('event/:eventType')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get listeners for a specific event type' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listeners for event type retrieved successfully',
  })
  getListenersForEvent(eventType: string): ResponseType<NotificationListener[]> {
    try {
      const listeners = this.listenerManager.getListenersForEvent(eventType);

      return {
        success: true,
        message: `Listeners for event type ${eventType} retrieved successfully`,
        data: listeners,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get listeners for event type');
    }
  }
}
