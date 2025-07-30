/**
 * Notification job interface
 * @description This interface defines the structure of a notification job
 */
export interface NotificationJob {
  userId: string;
  type: 'notification' | 'welcome-email' | 'verification-code';
  data: any;
  timestamp?: number;
}
