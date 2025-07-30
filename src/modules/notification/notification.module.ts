import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { BusinessEventController } from '../../presentation/controllers/business-event.controller';
import { NotificationListenerController } from '../../presentation/controllers/notification-listener.controller';
import { NotificationController } from '../../presentation/controllers/notification.controller';
import { sendgridConfig } from './configs/sendgrid.config';
import { twilioConfig } from './configs/twilio.config';
import { BusinessEventListener } from './listeners/business-event.listener';
import { NotificationLoggerListener } from './listeners/notification-logger.listener';
import { NotificationMetricsListener } from './listeners/notification-metrics.listener';
import { SendgridNotifier } from './notifiers/sendigrid.notifier';
import { TwilioNotifier } from './notifiers/twilio.notifier';
import { SendgridProvider } from './providers/sengrid.provider';
import { TwilioProvider } from './providers/twilio.provider';
import { BusinessEventEmitterService } from './services/business-event-emitter.service';
import { NotificationEventEmitterService } from './services/notification-event-emitter.service';
import { NotificationListenerManagerService } from './services/notification-listener-manager.service';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [
    ConfigModule.forFeature(sendgridConfig),
    ConfigModule.forFeature(twilioConfig),
    forwardRef(() => InfrastructureModule),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  controllers: [NotificationController, NotificationListenerController, BusinessEventController],
  providers: [
    SendgridProvider,
    TwilioProvider,
    SendgridNotifier,
    TwilioNotifier,
    NotificationService,
    NotificationEventEmitterService,
    NotificationListenerManagerService,
    BusinessEventEmitterService,
    NotificationLoggerListener,
    NotificationMetricsListener,
    BusinessEventListener,
  ],
  exports: [NotificationService, NotificationMetricsListener, BusinessEventEmitterService],
})
export class NotificationModule {}
